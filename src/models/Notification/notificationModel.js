import notificationCollection from "./notificationSchema.js";
import mongoose from "mongoose";
// create a notification
export const createNotification = (notificationData) => {
  return notificationCollection(notificationData).save();
};

// get notifications for a profile
export const getNotificationsByProfile = (authId) =>
  notificationCollection
    .find({ authId: new mongoose.Types.ObjectId(authId), isRead: false })
    .sort({ createdAt: -1 });

export const updateNotificationByProfile = (_id) => {
  return notificationCollection.findOneAndUpdate(
    { _id: new mongoose.Types.ObjectId(_id) }, // ⚡ convert string to ObjectId
    { isRead: true, readAt: new Date() },
    { new: true } // return updated doc
  );
};

export default notificationCollection;
