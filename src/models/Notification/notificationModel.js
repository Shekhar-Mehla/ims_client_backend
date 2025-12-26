import notificationCollection from "./notificationSchema.js";

// create a notification
export const createNotification = (notificationData) => {
  return notificationCollection(notificationData).save();
};

// get notifications for a profile
export const getNotificationsByProfile = (profileId) =>
  notificationCollection.find({ profileId }).sort({ createdAt: -1 });

export default notificationCollection;
