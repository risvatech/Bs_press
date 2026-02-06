import express from "express";
import {
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  deleteRole,
} from "../controllers/rolesController.js";

const router = express.Router();

router.post("/create", createRole);
router.get("/get", getAllRoles);
router.get("/get/:id", getRoleById);
router.put("/update/:id", updateRole);
router.delete("/:id", deleteRole);

export default router;
