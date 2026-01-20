import otpCollection from "./otpSchema.js";

export const createOtpModel = async (obj) => await otpCollection(obj).save();

export const getLatestOtpByAuthId = async (authId, purpose) => {
  return await otpCollection
    .findOne({ authId, purpose })
    .sort({ createdAt: -1 });
};
