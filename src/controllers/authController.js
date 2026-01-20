import responseClient from "../utility/responseClient.js";

// import { sendVerificationLink } from "../../services/emailService.js";
import {
  checkUserByEmail,
  createUser,
  updatePasswordByEmail,
  updateUserVerification,
  updateUser,
} from "../models/Auth/authModel.js";
import {
  createProfile,
  updateProfile,
} from "../models/Profile/profileModel.js";
import { bcryptPassword, comparePassword } from "../utility/bcrypt.js";

const hashPassword = bcryptPassword; // Alias for consistency
import generateOTP from "../utility/genrateOtp.js";
import {
  createOtpModel,
  getLatestOtpByAuthId,
} from "../models/Otp/otpModel.js";
import { otpEmailTemplate } from "../services/email/templates/emailOtp.js";
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

    const mail = await sendEmail({
      to: auth.email,
      subject: "Verify your email address",
      template: template,
    });

    // send email with verification link
    const verificationTemplate = emailVerificationTemplate(verificationUrl);

    try {
      const mailSent = await sendEmail({
        to: auth.email,
        subject: "Verify your email address",
        template: verificationTemplate,
      });
    } catch (emailError) {
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

    const profile = await getProfile(req.userInfo._id);

    if (!profile) {
      return responseClient({
        res,
        statusCode: 404,
        message: "Profile not found",
      });
    }

    // Combine profile and auth data (ensure email is present in payload)
    const profileObj = profile.toObject();

    // If authId is populated, extract email and flatten authId
    const authData = profileObj.authId || {};
    const email = authData.email || req.userInfo.email;

    const payload = {
      ...profileObj,
      email,
      // Keep authId as simple id for frontend
      authId: authData._id || profileObj.authId,
    };

    return responseClient({
      res,
      statusCode: 200,
      message: "Profile retrieved successfully",
      payload,
    });
  } catch (error) {
    next(error);
  }
};

// Update profile controller - merges partial updates and returns updated profile
export const updateProfileController = async (req, res, next) => {
  try {
    const allowedFields = [
      "fName",
      "lName",
      "countryCode",
      "mobile",
      "gender",
      "dateOfBirth",
      "address",
      "city",
      "state",
      "pincode",
      "educationLevel",
      "institutionName",
      "degree",
      "fieldOfStudy",
      "graduationYear",
      "cgpa",
      "skills",
      "linkedinUrl",
      "portfolioUrl",
      "githubUrl",
      "resumeUrl",
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (
        Object.prototype.hasOwnProperty.call(req.body, field) &&
        req.body[field] !== undefined &&
        req.body[field] !== null &&
        req.body[field] !== ""
      ) {
        updateData[field] = req.body[field];
      }
    });

    if (Object.keys(updateData).length === 0) {
      return responseClient({
        res,
        statusCode: 400,
        message: "No valid profile fields provided for update",
      });
    }

    const profile = await updateProfile(req.userInfo._id, updateData);

    if (!profile) {
      return responseClient({
        res,
        statusCode: 404,
        message: "Profile not found",
      });
    }

    const profileObj = profile.toObject();
    const authData = profileObj.authId || {};
    const email = authData.email || req.userInfo.email;

    const payload = {
      ...profileObj,
      email,
      authId: authData._id || profileObj.authId,
    };

    return responseClient({
      res,
      statusCode: 200,
      message: "Profile updated successfully",
      payload,
    });
  } catch (error) {
    next(error);
  }
};

export const changePasswordController = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const { email } = req.userInfo;

    if (!currentPassword || !newPassword) {
      return responseClient({
        res,
        statusCode: 400,
        message: "Current password and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return responseClient({
        res,
        statusCode: 400,
        message: "New password must be at least 8 characters long",
      });
    }

    // Get user by email
    const auth = await checkUserByEmail(email);
    if (!auth) {
      return responseClient({
        res,
        statusCode: 404,
        message: "User not found",
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(
      currentPassword,
      auth.password
    );
    if (!isCurrentPasswordValid) {
      return responseClient({
        res,
        statusCode: 400,
        message: "Current password is incorrect",
      });
    }

    const hashedNewPassword = await bcryptPassword(newPassword);

    await updatePasswordByEmail(email, hashedNewPassword);

    return responseClient({
      res,
      statusCode: 200,
      message: "Password changed successfully",
    });
  } catch (error) {
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

// Google login controller
export const googleLoginController = async (req, res, next) => {
  try {
    const { email, fName, lName, uid } = req.body;
    
    if (!email) {
      return responseClient({
        res,
        statusCode: 400,
        message: "Email is required",
      });
    }

    let auth = await checkUserByEmail(email);

    if (!auth) {
      // Create new user if they don't exist
      // Since it's Google login, we can skip the manual verification step
      auth = await createUser({
        email,
        password: await bcryptPassword(uid), // Use Firebase UID as a dummy password
        verified: true,
      });

      if (!auth?._id) {
        return responseClient({
          res,
          statusCode: 400,
          message: "Error creating user via Google",
        });
      }

      // Create profile for the new user
      await createProfile({
        authId: auth._id,
        fName: fName || "User",
        lName: lName || "",
        technologies: [],
        sectors: [],
        roles: [],
      });
    }

    // Generate JWTs
    const jwts = await generatejwts(auth._id, email, req);

    return responseClient({
      res,
      statusCode: 200,
      message: "Google login successful",
      payload: jwts,
    });
  } catch (error) {
    next(error);
  }
};
//logout Controller
export const logoutController = async (req, res, next) => {
  try {
    // await updateRefreshToken(email, null);
    // await deleteManySessionByAuthId(req.userInfo._id);
    const { authId } = req.body;

    if (!authId) {
      return responseClient({
        res,
        statusCode: 401,
        message: "Unauthorized: No token or authid provided",
      });
    }

    await deleteManySessionByAuthId(authId);
    const filter = { _id: authId };
    const update = { refreshToken: null };
    const user = await updateUser(filter, update);
    if (!user._id) {
      return responseClient({
        res,
        statusCode: 400,
        message: "Logout error",
      });
    }
    return responseClient({
      res,
      statusCode: 200,
      message: "Logout suucessfull",
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
      purpose: "reset_password",
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

    // Verify OTP
    const latestOtp = await getLatestOtpByAuthId(existing._id, "reset_password");

    if (!latestOtp) {
      return responseClient({
        res,
        statusCode: 400,
        message: "No OTP found for this request. Please request a new one.",
      });
    }

    if (latestOtp.code !== otp) {
      return responseClient({
        res,
        statusCode: 400,
        message: "Invalid OTP code",
      });
    }

    if (new Date() > latestOtp.expiresAt) {
      return responseClient({
        res,
        statusCode: 400,
        message: "OTP has expired. Please request a new one.",
      });
    }

    // hash the new password
    const hashedPassword = await bcryptPassword(newPassword);
    // update the password
    await updatePasswordByEmail(email, hashedPassword);

    // Mark OTP as used (optional, but good practice)
    // latestOtp.usedAt = new Date();
    // await latestOtp.save();

    sendEmail({
      to: existing.email,
      subject: "Password Changed",
      template: `<p>Your password has been changed successfully. For further technical assistance please contact Admin.</p>`,
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
