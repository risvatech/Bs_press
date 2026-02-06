import express from "express";
import {
  createApp,
  deleteApp,
  editApp,
  getAllApps,
  getAppBySlug,
} from "../controllers/appsController.js";

const router = express.Router();

router.post("/create", createApp);
router.patch("/edit", editApp);
router.delete("/delete/:id", deleteApp);
router.get("/getapps", getAllApps);
router.get("/slug/:slug", getAppBySlug);

export default router;
