import express from "express";
import { userAuthMiddleware } from "../middlewares/authMiddleware.js";
import {
  applyController,
  getAllApplicationsController,
  updateApplicationStatusController,
} from "../controllers/applicationController.js";
import upload from "../middlewares/multer/multerConfig.js";

const applicationRoutes = express.Router();

export default applicationRoutes;

//apply an application
applicationRoutes.post("/apply", upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'portfolio', maxCount: 1 }
]), applyController);
// applicationRoutes.post("/apply", userAuthMiddleware, applyController);

// get all applications
applicationRoutes.get(
  "/get-all-applications",
  userAuthMiddleware,
  getAllApplicationsController
);
// update application status
applicationRoutes.patch(
  "/update-application-status/:id",
  userAuthMiddleware,
  updateApplicationStatusController
);
