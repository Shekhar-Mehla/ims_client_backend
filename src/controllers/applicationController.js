import {
  applyApplicationModel,
  getAllApplicationsModel,
  updateApplicationStatusModel,
} from "../models/Application/applicationModel.js";
import uploadToCloudinary from "../utility/cloudinaryUploader.js";
import deleteFile from "../utility/deleteFile.js";
// import { createNotification } from "../models/Notification/notificationModel.js";
import responseClient from "../utility/responseClient.js";

export const applyController = async (req, res, next) => {
  try {
    const documents = {};

    // Upload files to Cloudinary and collect URLs
    if (req.files) {
      const uploadPromises = [];

      if (req.files.resume && req.files.resume[0]) {
        uploadPromises.push(
          uploadToCloudinary(req.files.resume[0].path).then((result) => {
            documents.resumeUrl = result.url;
            documents.resumePublicId = result.public_id;
          })
        );
      }

      if (req.files.portfolio && req.files.portfolio[0]) {
        uploadPromises.push(
          uploadToCloudinary(req.files.portfolio[0].path).then((result) => {
            documents.portfolioUrl = result.url;
            documents.portfolioPublicId = result.public_id;
          })
        );
      }

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);
    }

    const applicationData = {
      internshipId: req.body.internshipId,
      userId: req.userInfo,
      profileId: req.body.profileId,
      preferences: {
        startDate: new Date(req.body.startDate),
        duration: req.body.duration,
        expectedStipend: req.body.expectedStipend,
        workMode: req.body.workMode,
        whyThisInternship: req.body.whyThisInternship,
        coverLetter: req.body.coverLetter,
      },
      documents,
      agreeTerms: req.body.agreeTerms,
      source: req.body.source || "direct",
    };

    // // Save application to database
    const application = await applyApplicationModel(applicationData);
    if (!application?._id) {
      return responseClient({
        res,
        message: "something went wrong while submitting the application",
        statusCode: 500,
      });
    }

    return responseClient({
      res,
      message: "Application submitted successfully",
      payload: {
        applicationId: application._id,
        status: application.status,
        submittedAt: application.submittedAt,
        documents: application.documents,
      },
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// get all applications controller
export const getAllApplicationsController = async (req, res, next) => {
  try {
    // logic to get all applications will go here
    const applications = await getAllApplicationsModel();
    if (!applications) {
      return responseClient({
        res,
        statusCode: 400,
        message: "Failed to get all applications",
      });
    }
    return responseClient({
      res,
      message: "Get all applications controller is working",
      payload: applications,
    });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatusController = async (req, res, next) => {
  try {
    const { status } = req.body;

    const { id } = req.params;

    const updatedApplication = await updateApplicationStatusModel(id, status);

    if (!updatedApplication) {
      return responseClient({
        res,
        statusCode: 400,
        message: "Failed to update application status",
      });
    }

    //notify user about the status update via email (to be implemented)

    // save notification to db

    const notificationData = {
      authId: updatedApplication.profileId.authId,
      message: `Your application status is ${status}`,
      type: "application_update",
      referenceId: updatedApplication._id,
      referenceModel: "Application",
    };
    await createNotification(notificationData);
    // notify user using socket
    const io = req.app.get("io"); // get socket.io instance

    io.to(updatedApplication.profileId.authId.toString()).emit(
      "applicationStatusUpdated",
      {
        applicationId: id,
        newStatus: status,
        message: `Your application status changed to ${status}`,
      }
    );

    return responseClient({
      res,
      message: "Application status updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
