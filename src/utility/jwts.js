import jwt from "jsonwebtoken";
import { updateRefreshToken } from "../models/Auth/authModel.js";
import { createSession } from "../models/Session/sessionModel.js";

// Check if JWT secrets are configured

export const generateAccessToken = async (authId,email, req) => {
  const accessToken = await jwt.sign(
    { authId: email.toString() },
    process.env.ACCESS_SECRETKEY,
    {
      expiresIn: "1m",
    }
  );
  console.log("Generated access token");
  const obj = {
    authId,
    accessToken,
    userAgent: req.headers["user-agent"] || null,
    ip: req.ip || null,
    expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes from now
  };
  console.log("Session object created");
  await createSession(obj);
  return accessToken;
};

export const verfiyAccessToken = (token) => {
  const decoded = jwt.verify(token, process.env.ACCESS_SECRETKEY);
  return decoded;
};
export const generateRefreshToken = async (email) => {
  const refreshToken = await jwt.sign(
    { email },
    process.env.REFRESH_SECRETKEY,
    {
      expiresIn: "7d",
    }
  );
  await updateRefreshToken(email, refreshToken);
  return refreshToken;
};
export const verfiyRefreshToken = (token) => {
  const decoded = jwt.verify(token, process.env.REFRESH_SECRETKEY);
  return decoded;
};

export const generateEmailVerificationToken = async (authId, email) => {
  const verificationToken = await jwt.sign(
    {
      authId: authId.toString(),
      email,
      purpose: "email_verification",
    },
    process.env.ACCESS_SECRETKEY,
    {
      expiresIn: "24h", // 24 hours for email verification
    }
  );
  console.log("Generated email verification token");
  return verificationToken;
};

export const generatejwts = async (authId, email, req) => {
  const obj = {
    accessToken: await generateAccessToken(authId,email, req),
    refreshToken: await generateRefreshToken(email),
  };

  return obj;
};
