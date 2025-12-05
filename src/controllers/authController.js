import responseClient from "../utility/responseClient.js";

// import { sendVerificationLink } from "../../services/emailService.js";
import {
  checkUserByEmail,
  createUser,
  updatePasswordByEmail,
  updateRefreshToken,
  updateUserVerification,
} from "../models/Auth/authModel.js";
import { createProfile } from "../models/Profile/profileModel.js";
import { bcryptPassword, comparePassword } from "../utility/bcrypt.js";

const hashPassword = bcryptPassword; // Alias for consistency
// import generateOTP from "../utility/genrateOtp.js";
// import { createOtpModel } from "../models/Otp/otpModel.js";
// import { otpEmailTemplate } from "../services/email/templates/emailOtp.js";
import { emailVerificationTemplate } from "../services/email/templates/emailVerification.js";
import { sendEmail } from "../services/email/sendEmail.js";
import {
  generatejwts,
  generateEmailVerificationToken,
  verfiyAccessToken,
} from "../utility/jwts.js";
import { deleteManySessionByAuthId } from "../models/Session/sessionModel.js";

export const registerController = async (req, res) => {
  try {
    const { fName, lName, email, password, technologies, sectors, roles } =
      req.body;
    console.log(req.body, "29");
    const existing = await checkUserByEmail(email);
    if (existing) {
      return responseClient({
        res,
        statusCode: 409,
        message: "Email already registered",
        payload: null,
      });
    }
    // hashed the password
    const hashedPassword = await bcryptPassword(req.body.password);
    console.log(hashedPassword, "31");

    const auth = await createUser({
      email,
      password: hashedPassword,
      verified: false,
    });
    if (!auth?._id) {
      return responseClient({
        res,
        statusCode: 400,
        message: "error in creating user",
      });
    }
    const profile = await createProfile({
      authId: auth._id,
      fName,
      lName,
      technologies,
      sectors,
      roles,
    });
    if (!profile?._id) {
      return responseClient({
        res,
        statusCode: 400,
        message: "error in creating user profile",
        payload: null,
      });
    }
    // create email verification token
    const verificationToken = await generateEmailVerificationToken(
      auth._id,
      email
    );

    // create verification URL (points to frontend page)
    const frontendUrl = process.env.ROOT_URL || "http://localhost:5173";
    const verificationUrl = `${frontendUrl}/email-verified?token=${verificationToken}`;

    // send email with verification link
    const template = emailVerificationTemplate(verificationUrl);
    console.log("Verification URL:", verificationUrl);

    const mail = await sendEmail({
      to: auth.email,
      subject: "Verify your email address",
      template: template,
    });

    // send email with verification link
    const verificationTemplate = emailVerificationTemplate(verificationUrl);
    console.log("Verification URL:", verificationUrl);

    try {
      const mailSent = await sendEmail({
        to: auth.email,
        subject: "Verify your email address",
        template: verificationTemplate,
      });

      if (!mailSent) {
        console.error("Failed to send verification email");
      }
    } catch (emailError) {
      console.error("Email sending error:", emailError);
    }

    return responseClient({
      res,
      statusCode: 200,
      message: "Registration successful. Please verify your email.",
      payload: {
        authId: auth._id,
        profileId: profile._id,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    return responseClient({
      res,
      statusCode: 500,
      message: "Server error during registration",
    });
  }
};

// verify email controller
export const verifyEmailController = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return responseClient({
        res,
        statusCode: 400,
        message: "Verification token is required",
      });
    }

    // Verify the token
    const decoded = verfiyAccessToken(token);

    if (!decoded || decoded.purpose !== "email_verification") {
      return responseClient({
        res,
        statusCode: 400,
        message: "Invalid or expired verification token",
      });
    }

    // Update user verification status
    const updatedUser = await updateUserVerification(decoded.authId, true);

    if (!updatedUser) {
      return responseClient({
        res,
        statusCode: 400,
        message: "Failed to verify email",
      });
    }

    // Return JSON response for frontend API call
    return responseClient({
      res,
      statusCode: 200,
      message: "Email verified successfully",
      payload: {
        email: decoded.email,
        verified: true,
      },
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return responseClient({
      res,
      statusCode: 400,
      message: "Invalid or expired verification token",
    });
  }
};

// Profile controller
export const getProfileController = async (req, res, next) => {
  try {
    const { getProfile } = await import("../models/Profile/profileModel.js");
    const { getUserById } = await import("../models/Auth/authModel.js");

    const profile = await getProfile(req.userInfo._id);
    const auth = await getUserById(req.userInfo._id);

    if (!profile) {
      return responseClient({
        res,
        statusCode: 404,
        message: "Profile not found",
      });
    }

    // Combine profile and auth data
    const userProfile = {
      _id: auth._id,
      email: auth.email,
      fName: profile.fName,
      lName: profile.lName,
      avatarUrl: profile.avatarUrl,
      resumeUrl: profile.resumeUrl,
      technologies: profile.technologies,
      sectors: profile.sectors,
      roles: profile.roles,
      createdAt: auth.createdAt,
      updatedAt: auth.updatedAt,
    };

    return responseClient({
      res,
      statusCode: 200,
      message: "Profile retrieved successfully",
      payload: userProfile,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return responseClient({
      res,
      statusCode: 500,
      message: "Internal server error",
    });
  }
};

export const changePasswordController = async (req, res, next) => {
  try {
    console.log("Change password request received");
    const { currentPassword, newPassword } = req.body;
    console.log("Request body:", {
      currentPassword: !!currentPassword,
      newPassword: !!newPassword,
    });
    console.log("User info:", req.userInfo);

    const { email } = req.userInfo;

    if (!currentPassword || !newPassword) {
      console.log("Missing required fields");
      return responseClient({
        res,
        statusCode: 400,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      console.log("New password too short");
      return responseClient({
        res,
        statusCode: 400,
        message: "New password must be at least 8 characters long",
      });
    }

    console.log("Getting user by email:", email);
    // Get user by email
    const auth = await checkUserByEmail(email);
    if (!auth) {
      console.log("User not found");
      return responseClient({
        res,
        statusCode: 404,
        message: "User not found",
      });
    }

    console.log("Verifying current password");
    // Verify current password
    const isCurrentPasswordValid = await comparePassword(
      currentPassword,
      auth.password
    );
    if (!isCurrentPasswordValid) {
      console.log("Current password incorrect");
      return responseClient({
        res,
        statusCode: 400,
        message: "Current password is incorrect",
      });
    }

    console.log("Hashing new password");
    // Hash new password
    const hashedNewPassword = await bcryptPassword(newPassword);

    console.log("Updating password in database");
    // Update password
    await updatePasswordByEmail(email, hashedNewPassword);

    console.log("Password changed successfully");
    return responseClient({
      res,
      statusCode: 200,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);
    console.error("Error stack:", error.stack);
    return responseClient({
      res,
      statusCode: 500,
      message: "Internal server error",
    });
  }
};

//login controller
export const loginController = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const auth = await checkUserByEmail(email);

    if (auth?._id) {
      const isMatch = await comparePassword(password, auth.password);

      if (isMatch) {
        const jwts = await generatejwts(auth?._id, email, req);

        return responseClient({
          res,
          statusCode: 200,
          message: "login successful",
          payload: jwts,
        });
      } else {
        // Password doesn't match
        return responseClient({
          res,
          statusCode: 401,
          message: "Invalid email or password",
        });
      }
    } else {
      // User not found
      return responseClient({
        res,
        statusCode: 401,
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    next(error);
  }
};
//logout Controller
export const logoutController = async (req, res, next) => {
  try {
    const { email } = req.userInfo;
    await updateRefreshToken(email, null);
    await deleteManySessionByAuthId(req.userInfo._id);

    return responseClient({
      res,
      statusCode: 200,
      message: "Logout successful",
    });
  } catch (error) {
    next(error);
  }
};
// generate new otp controller
export const generateNewOtpController = async (req, res, next) => {
  try {
    const { email } = req.body;
    const existing = await checkUserByEmail(email);
    if (!existing) {
      return responseClient({
        res,
        statusCode: 404,
        message: "Email not registered",
        payload: null,
      });
    }
    // create otp
    const otpCode = await generateOTP();
    // store otp into otp collection
    const otpObject = {
      authId: existing._id,
      code: otpCode,
      purpose: "email_verification",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    };
    const otp = await createOtpModel(otpObject);
    // send email with otp
    sendEmail({
      to: existing.email,
      subject: otp.purpose,
      template: otpEmailTemplate(otp.code),
    });
    if (!otp._id) {
      return responseClient({
        res,
        statusCode: 400,
        message: "error in creating otp",
        payload: null,
      });
    }
    // send email with otp
    return responseClient({
      res,
      statusCode: 200,
      message: "OTP sent successfully",
      payload: otp.code,
    });
  } catch (error) {
    next(error);
  }
};

// forget password controller
export const forgetPasswordController = async (req, res, next) => {
  try {
    const { email, newPassword, otp } = req.body;
    const existing = await checkUserByEmail(email);
    if (!existing) {
      return responseClient({
        res,
        statusCode: 404,
        message: "Email not registered",
        payload: null,
      });
    }
    // hash the new password
    const hashedPassword = await bcryptPassword(newPassword);
    // update the password
    await updatePasswordByEmail(email, hashedPassword);
    sendEmail({
      to: existing.email,
      subject: "Password Changed",
      template: `<p>Your password has been changed successfully. For the further technical assistant please contact Admin.</p>`,
    });
    // send email notification about password change
    return responseClient({
      res,
      statusCode: 200,
      message: "Password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
