import { db } from "../db/sql.js";
import { users, activities, userPermissions, roles } from "../db/schema.js";
import { and, eq } from "drizzle-orm";
import bcrypt from "bcrypt";

// CREATE USER (admin creates new user)
export const createUser = async (req, res) => {
    const {
        username,
        email,
        password,
        firstName,
        lastName,
        roleId,
        status,
        profileImageUrl,
        createdBy,
    } = req.body;

    if (!username || !email || !password) {
        return res
            .status(400)
            .json({ message: "username, email, and password are required." });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const inserted = await db
            .insert(users)
            .values({
                username,
                email,
                password: hashedPassword,
                firstName,
                lastName,
                roleId,
                status: status || "active",
                profileImageUrl,
                createdBy,
            })
            .returning();

        const newUser = inserted[0];

        // ✅ log into activities
        await db.insert(activities).values({
            type: "user_created",
            description: `User ${newUser.username} created`,
            entityType: "user",
            entityId: newUser.id,
            createdBy,
        });

        res
            .status(201)
            .json({ message: "User created successfully", user: newUser });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// DELETE USER
export const deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        // ✅ Convert ID safely to integer if your schema uses serial/int
        const userId = parseInt(id, 10);
        if (isNaN(userId)) {
            return res.status(400).json({ message: "Invalid user ID" });
        }

        // ✅ Delete and return the deleted row(s)
        const deletedRows = await db
            .delete(users)
            .where(eq(users.id, userId))
            .returning();

        if (deletedRows.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        const deletedUser = deletedRows[0];

        // ✅ Optional: If user.createdBy might be NULL, handle gracefully
        const createdBy = deletedUser.createdBy ?? null;

        // ✅ Log deletion activity
        await db.insert(activities).values({
            type: "user_deleted",
            description: `User ${deletedUser.username || "unknown"} deleted`,
            entityType: "user",
            entityId: deletedUser.id,
            createdBy,
        });

        res.json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params; // user ID to update
    const { username, email, firstName, lastName, status } = req.body;

    if (!id) {
        return res.status(400).json({ message: "User ID is required." });
    }

    try {
        // Check if user exists
        const user = await db
            .select()
            .from(users)
            .where(eq(users.id, Number(id)));

        if (!user[0]) {
            return res.status(404).json({ message: "User not found." });
        }

        // Update fields
        const updatedUser = await db
            .update(users)
            .set({
                username,
                email,
                firstName,
                lastName,
                status,
            })
            .where(eq(users.id, Number(id)))
            .returning();

        // Log activity
        await db.insert(activities).values({
            type: "user_updated",
            description: `User ${updatedUser[0].username} updated`,
            entityType: "user",
            entityId: updatedUser[0].id,
            createdBy: req.body.createdBy, // pass the admin ID or user performing update
        });

        res
            .status(200)
            .json({ message: "User updated successfully", user: updatedUser[0] });
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateUserPassword = async (req, res) => {
    const { id } = req.params; // user ID
    const { password, createdBy } = req.body;

    if (!password) {
        return res.status(400).json({ message: "Password is required." });
    }

    try {
        const user = await db
            .select()
            .from(users)
            .where(eq(users.id, Number(id)));

        if (!user[0]) {
            return res.status(404).json({ message: "User not found." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const updatedUser = await db
            .update(users)
            .set({ password: hashedPassword })
            .where(eq(users.id, Number(id)))
            .returning();

        // Log activity
        await db.insert(activities).values({
            type: "password_updated",
            description: `Password updated for user ${updatedUser[0].username}`,
            entityType: "user",
            entityId: updatedUser[0].id,
            createdBy: createdBy,
        });

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        console.error("Error updating password:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateUserRole = async (req, res) => {
    const { id } = req.params; // user ID
    const { roleId, createdBy } = req.body;

    if (!roleId) {
        return res.status(400).json({ message: "Role ID is required." });
    }

    try {
        // 1. Check if user exists
        const user = await db
            .select()
            .from(users)
            .where(eq(users.id, Number(id)));

        if (!user[0]) {
            return res.status(404).json({ message: "User not found." });
        }

        // 2. Update role for the user
        const updatedUser = await db
            .update(users)
            .set({ roleId })
            .where(eq(users.id, Number(id)))
            .returning();

        // 3. Fetch role permissions (JSONB)
        const role = await db.select().from(roles).where(eq(roles.id, roleId));

        const rolePermissions = role[0]?.permissions || {};

        // 4. Remove old user permissions
        await db
            .delete(userPermissions)
            .where(eq(userPermissions.userId, updatedUser[0].id));

        // 5. Insert role permissions into user_permissions
        if (rolePermissions && Object.keys(rolePermissions).length > 0) {
            const newPerms = [];

            for (const [module, perms] of Object.entries(rolePermissions)) {
                newPerms.push({
                    userId: updatedUser[0].id,
                    module,
                    enabled: perms.enabled || false,
                    canRead: perms.canRead || false,
                    canWrite: perms.canWrite || false,
                    canDelete: perms.canDelete || false,
                });
            }

            if (newPerms.length > 0) {
                await db.insert(userPermissions).values(newPerms);
            }
        }

        // 6. Log activity
        await db.insert(activities).values({
            type: "role_updated",
            description: `Role updated for user ${updatedUser[0].username} (permissions reset from role)`,
            entityType: "user",
            entityId: updatedUser[0].id,
            createdBy: createdBy,
        });

        res.status(200).json({
            message: "User role & permissions updated successfully",
            user: updatedUser[0],
        });
    } catch (error) {
        console.error("Error updating user role:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const getUserPermissions = async (req, res) => {
    const { id } = req.params; // user ID

    try {
        // First check if user exists
        const user = await db
            .select()
            .from(users)
            .where(eq(users.id, Number(id)));

        if (!user[0]) {
            return res.status(404).json({ message: "User not found." });
        }

        // Fetch permissions for the user
        const permissions = await db
            .select()
            .from(userPermissions)
            .where(eq(userPermissions.userId, Number(id)));

        res.status(200).json({
            message: "User permissions fetched successfully",
            user: user[0],
            permissions,
        });
    } catch (error) {
        console.error("Error fetching user permissions:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const updateUserPermissions = async (req, res) => {
    const { id } = req.params; // user ID
    const { permissions, createdBy } = req.body;

    if (!permissions || !Array.isArray(permissions)) {
        return res.status(400).json({ message: "Permissions array is required." });
    }

    if (!id) {
        return res.status(400).json({ message: "User ID is required." });
    }

    try {
        // Check if user exists
        const user = await db
            .select()
            .from(users)
            .where(eq(users.id, Number(id)));

        if (!user[0]) {
            return res.status(404).json({ message: "User not found." });
        }

        // Update or insert each permission
        for (const perm of permissions) {
            const { module, canRead, canWrite, canDelete, enabled } = perm;

            // Combine conditions in one where
            const existing = await db
                .select()
                .from(userPermissions)
                .where(
                    and(
                        eq(userPermissions.userId, Number(id)),
                        eq(userPermissions.module, module),
                    ),
                );

            if (existing[0]) {
                await db
                    .update(userPermissions)
                    .set({
                        canRead: canRead || false,
                        canWrite: canWrite || false,
                        canDelete: canDelete || false,
                        enabled: enabled || false,
                    })
                    .where(eq(userPermissions.id, existing[0].id))
                    .returning();
            } else {
                await db.insert(userPermissions).values({
                    userId: Number(id),
                    module,
                    canRead: canRead || false,
                    canWrite: canWrite || false,
                    canDelete: canDelete || false,
                    enabled: enabled || false,
                });
            }
        }

        // Log activity
        await db.insert(activities).values({
            type: "permissions_updated",
            description: `Custom permissions updated for user ${user[0].username}`,
            entityType: "user",
            entityId: user[0].id,
            createdBy: createdBy,
        });

        res.status(200).json({
            message: "User permissions updated successfully",
        });
    } catch (error) {
        console.error("Error updating user permissions:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
