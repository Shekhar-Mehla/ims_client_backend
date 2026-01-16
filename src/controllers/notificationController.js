import {
  getNotificationsByProfile,
  updateNotificationByProfile,
} from "../models/Notification/notificationModel.js";
import responseClient from "../utility/responseClient.js";

export const getnotificationControllerbyId = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return responseClient({
      res,
      statusCode: 400,
      message: " userid is requred",
    });
  }

  try {
    const response = await getNotificationsByProfile(id);

    return responseClient({
      res,
      payload: response,
      message: "here is all the unread notification",
    });
  } catch (error) {
    next(error);
  }
};



export const updatenotificationControllerbyId = async (req, res, next) => {
  const { notificationid } = req.params;
  
  if (!notificationid) {
    return responseClient({
      res,
      statusCode: 400,
      message: "notificationid is required",
    });
  }

  try {
    const updatedNotification = await updateNotificationByProfile(
      notificationid
    );

    if (!updatedNotification) {
      return responseClient({
        res,
        statusCode: 404,
        message: "Notification not found",
      });
    }

    return responseClient({
      res,
      payload: updatedNotification,
      message: "Notification is marked as read",
    });
  } catch (error) {
    next(error);
  }
};
