import profileCollection from "./profileSchema.js";

export const createProfile = async (data) =>
  await profileCollection(data).save();

export const getProfile = async (authId) =>
  await profileCollection.findOne({ authId });

export const updateProfile = async (authId, updateData) =>
  await profileCollection.findOneAndUpdate({ authId }, updateData, {
    new: true,
  });

export const deleteProfile = async (authId) =>
  await profileCollection.findOneAndDelete({ authId });
