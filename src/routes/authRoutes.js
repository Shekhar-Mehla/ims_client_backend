import express from "express";
import registerDataValidator, {
  changePasswordDataValidator,
  forgetPasswordDataValidator,
  generateNewOtpDataValidator,
  loginDataValidator,
} from "../joiValidators/registerDataValidator.js";

import {
  changePasswordController,
  forgetPasswordController,
  generateNewOtpController,
  getProfileController,
  loginController,
  logoutController,
  registerController,
  verifyEmailController,
  updateProfileController,
  googleLoginController,
} from "../controllers/authController.js";
import {
  renewAccessTokenMiddleware,
  userAuthMiddleware,
} from "../middlewares/authMiddleware.js";
const authRoutes = express.Router();

authRoutes.post("/register", registerDataValidator, registerController);
authRoutes.get("/verify-email", verifyEmailController);
authRoutes.post("/login", loginDataValidator, loginController);
authRoutes.post("/google-login", googleLoginController);
authRoutes.post("/logout", logoutController);
authRoutes.post(
  "/change-password",
  userAuthMiddleware,
  changePasswordDataValidator,
  changePasswordController
);
authRoutes.post(
  "/generate-new-otp",
  generateNewOtpDataValidator,
  generateNewOtpController
);
authRoutes.post(
  "/forget-password",
  forgetPasswordDataValidator,
  forgetPasswordController
);
authRoutes.post("/renew-access-token", renewAccessTokenMiddleware);
authRoutes.get("/profile", userAuthMiddleware, getProfileController);
authRoutes.patch("/profile", userAuthMiddleware, updateProfileController);
export default authRoutes;
