import express from "express";
import {
    createUser,
    deleteUser,
    getUserPermissions,
    updateUser,
    updateUserPassword,
    updateUserPermissions,
    updateUserRole,
} from "../controllers/userController.js";

const router = express.Router();

// Create new user (admin only)
router.post("/create", createUser);
router.delete("/:id", deleteUser);
router.put("/update/:id", updateUser);
router.put("/password/:id", updateUserPassword);
router.put("/role/:id", updateUserRole);
router.get("/permission/:id", getUserPermissions);
router.put("/permission/:id", updateUserPermissions);

export default router;
