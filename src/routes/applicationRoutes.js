import express from "express";
import { userAuthMiddleware } from "../middlewares/authMiddleware.js";
import {
  applyController,
  getAllApplicationsController,
  updateApplicationStatusController,
  getApplicationsByUserController,
  getApplicationDetailsController,
} from "../controllers/applicationController.js";
import upload from "../middlewares/multer/multerConfig.js";

const applicationRoutes = express.Router();

//apply an application
applicationRoutes.post(
  "/apply",
  userAuthMiddleware,
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "portfolio", maxCount: 1 },
  ]),
  applyController
);

// get applications by user
applicationRoutes.get(
  "/user/:userId",
  userAuthMiddleware,
  getApplicationsByUserController
);

// get single application details
applicationRoutes.get(
  "/details/:id",
  userAuthMiddleware,
  getApplicationDetailsController
);

// get all applications
applicationRoutes.get(
  "/get-all-applications",
  userAuthMiddleware,
  getAllApplicationsController
);

// update application status (frontend expects PUT /update-status/:id)
applicationRoutes.put(
  "/update-status/:id",
  userAuthMiddleware,
  updateApplicationStatusController
);

// update application status (legacy path retained)
applicationRoutes.patch(
  "/update-application-status/:id",
  userAuthMiddleware,
  updateApplicationStatusController
);

export default applicationRoutes;
