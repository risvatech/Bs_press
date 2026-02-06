import { db, safeQuery } from "../db/sql.js";   // pg Pool or Client
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {eq} from "drizzle-orm";
import {roles, userPermissions, users} from "../db/schema.js";
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();


// helper: create JWT
const createToken = (user) => {
    return jwt.sign(
        { id: user.id, username: user.username, roleId: user.role_id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    );
};

// helper: set cookie
const setTokenCookie = (res, token) => {
    res.cookie("auth_token", token, {
        httpOnly: true,
        secure: false,   // true only in production HTTPS
        sameSite: "Lax",
        maxAge: 24 * 60 * 60 * 1000,
    });
};

// ✅ REGISTER
export const register = async (req, res) => {
    const { username, email, password, firstName, lastName } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ message: "Username, email, and password are required" });
    }

    try {
        // check if user already exists
        const existing = await safeQuery(
            `SELECT id FROM users WHERE username = $1 OR email = $2 LIMIT 1`,
            [username, email]
        );
        if (existing.rows.length > 0) {
            return res.status(400).json({ message: "Username or email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await client.query(
            `INSERT INTO users (username, email, password, first_name, last_name, status)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, username, email, first_name, last_name, role_id, status`,
            [username, email, hashedPassword, firstName || null, lastName || null, "active"]
        );

        const newUser = result.rows[0];
        const token = createToken(newUser);

        setTokenCookie(res, token);

        res.status(201).json(newUser);
    } catch (err) {
        console.error("❌ Register error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ✅ LOGIN
export async function login(req, res, next) {
    try {
        const { username, password } = req.body;

        const [user] = await db
            .select()
            .from(users)
            .where(eq(users.username, username))
            .limit(1);

        if (!user) return res.status(401).json({ message: "Invalid username" });

        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword)
            return res.status(401).json({ message: "Invalid Password" });

        const token = jwt.sign(
            {
                id: user.id,
                username: user.username,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" },
        );

        // Set cookie
        res.cookie("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 24 * 60 * 60 * 1000,
        });

        // Fetch role info
        const [role] = await db
            .select()
            .from(roles)
            .where(eq(roles.id, user.roleId));

        // Fetch user permissions (custom or role-based)
        const permissions = await db
            .select()
            .from(userPermissions)
            .where(eq(userPermissions.userId, user.id))
            .limit(100);

        res.json({
            message: "User Logged In Successfully",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                first_name: user.first_name,
                last_name: user.last_name,
                role: role ? role.name : null,
                roleDisplayName: role ? role.displayName : null,
                permissions, // array of permissions
            },
        });
    } catch (e) {
        next(e);
    }
}

// ✅ LOGOUT
export const logoutUser = (req, res) => {
    try {
        res.clearCookie("auth_token");
        res.json({ message: "Logged out successfully" });
    } catch (err) {
        console.error("❌ Logout error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ✅ CURRENT USER
export const userDetails = async (req, res) => {
    try {
        const token = req.cookies.auth_token;
        if (!token) return res.status(401).json({ message: "Not authenticated" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const result = await safeQuery(
            `SELECT id, username, email, first_name, last_name, role_id, status
             FROM users WHERE id = $1 LIMIT 1`,
            [decoded.id]
        );

        const user = result.rows[0];
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);   // ✅ plain user object
    } catch (err) {
        console.error("❌ User details error:", err);
        res.status(401).json({ message: "Invalid or expired token" });
    }
};

// ✅ CHANGE PASSWORD
export const changePassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    const token = req.cookies.auth_token;

    if (!token) return res.status(401).json({ message: "Not authenticated" });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const result = await safeQuery(`SELECT * FROM users WHERE id = $1 LIMIT 1`, [decoded.id]);
        const user = result.rows[0];

        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch) return res.status(400).json({ message: "Old password is incorrect" });

        const hashed = await bcrypt.hash(newPassword, 10);
        await safeQuery(`UPDATE users SET password = $1 WHERE id = $2`, [hashed, decoded.id]);

        res.json({ message: "Password updated successfully" });
    } catch (err) {
        console.error("❌ Change password error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ✅ ADMIN: GET ALL USERS
export const getAllUsers = async (req, res) => {
    try {
        // 🚨 ADD THESE 4 LINES:
        const page = parseInt(req.query.page) || 1;
        const MAX_LIMIT = 100;
        const limit = Math.min(parseInt(req.query.limit) || 50, MAX_LIMIT);
        const offset = (page - 1) * limit;

        const result = await db
            .select({
                id: users.id,
                username: users.username,
                email: users.email,
                firstName: users.firstName,
                lastName: users.lastName,
                role_id: users.roleId,
                status: users.status,
            })
            .from(users)
            .limit(limit)    // 🚨 ADD THIS
            .offset(offset); // 🚨 ADD THIS

        res.json(result);
    } catch (err) {
        console.error("❌ Get users error:", err);
        res.status(500).json({ message: "Server error" });
    }
};

// ✅ ADMIN: GET SINGLE USER
export const getUserDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await safeQuery(
            `SELECT id, username, email, first_name, last_name, role_id, status FROM users WHERE id = $1 LIMIT 1`,
            [id]
        );

        if (result.rows.length === 0) return res.status(404).json({ message: "User not found" });

        res.json(result.rows[0]);
    } catch (err) {
        console.error("❌ Get user error:", err);
        res.status(500).json({ message: "Server error" });
    }
};
