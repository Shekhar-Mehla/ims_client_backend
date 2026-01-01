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

// export const updatenotificationControllerbyId = async (req, res, next) => {
//   const { notificationid } = req.params;
//   console.log(notificationid);
//   try {
//     if (!notificationid) {
//       return responseClient({
//         res,
//         statusCode: 400,
//         message: "notificationid is requred",
//       });
//     }
//     const updatedNotification = await updateNotificationByProfile(
//       notificationid
//     );

//     return responseClient({
//       res,
//       message: "Notification is marked as read",
//       payload: updatedNotification,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export const updatenotificationControllerbyId = async (req, res, next) => {
//   const { notificationid } = req.params;

//   if (!notificationid) {
//     return responseClient({
//       res,
//       statusCode: 400,
//       message: "notificationid is required",
//     });
//   }

//   try {
//     const result = await updateNotificationByProfile(notificationid);

//     if (result.modifiedCount === 0) {
//       return responseClient({
//         res,
//         statusCode: 404,
//         message: "Notification not found or already read",
//       });
//     }

//     // const updatedNotification = await notificationCollection.findById(
//     //   notificationid
//     // );

//     return responseClient({
//       res,
//       payload: result,
//       //   payload: updatedNotification,
//       message: "Notification is marked as read",
//     });
//   } catch (error) {
//     next(error);
//   }
// };

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
    console.error(error);
    next(error);
  }
};
