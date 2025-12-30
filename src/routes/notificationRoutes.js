import express from "express";
import { userAuthMiddleware } from "../middlewares/authMiddleware.js";
import {
  getnotificationControllerbyId,
  updatenotificationControllerbyId,
} from "../controllers/notificationController.js";
const notificationRoutes = express.Router();

notificationRoutes.get(
  "/:id",
  userAuthMiddleware,
  getnotificationControllerbyId
);
notificationRoutes.patch(
  "/update/:notificationid",
  userAuthMiddleware,
  updatenotificationControllerbyId
);

export default notificationRoutes;
