// routes/install.js
import express from "express";
import { testDbDetails, runInstallation } from "../controllers/installController.js";

const router = express.Router();

// ✅ Test database connection
router.post("/test-db", testDbDetails);

// ✅ Run installation (create tables + seed admin)
router.post("/install", runInstallation);

export default router;
