import express from "express";
import {
    login,
    register,
    logoutUser,
    userDetails,
    changePassword,
    getAllUsers,
    getUserDetails,
    // add/update/delete user
} from "../controllers/authController.js";

const router = express.Router();

// Auth
router.post("/login", login);             // POST /api/auth/login
router.post("/register", register);       // POST /api/auth/register
router.post("/logout", logoutUser);       // POST /api/auth/logout
router.get("/user", userDetails);         // GET  /api/auth/user (current user via cookie/JWT)
router.post("/change-password", changePassword); // POST /api/auth/change-password

// Users
router.get("/users", getAllUsers);         // GET /api/auth/users
router.get("/users/:id", getUserDetails);  // GET /api/auth/users/:id


export default router;
