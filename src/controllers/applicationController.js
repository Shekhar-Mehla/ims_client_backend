import {
  applyApplicationModel,
  getAllApplicationsModel,
  updateApplicationStatusModel,
  getApplicationsByUserModel,
} from "../models/Application/applicationModel.js";
import { updateProfile } from "../models/Profile/profileModel.js";
import { createNotification } from "../models/Notification/notificationModel.js";
import uploadToCloudinary from "../utility/cloudinaryUploader.js";
import deleteFile from "../utility/deleteFile.js";
import responseClient from "../utility/responseClient.js";

import internshipCollection from "../models/Intership/internshipSchema.js";
import applicationCollection from "../models/Application/applicationSchema.js";

export const applyController = async (req, res, next) => {
  try {
    const documents = {};
    console.log(req.body, ".......body");

    // Basic validations
    const internshipId = req.body.internshipId || null;
    const profileId = req.body.profileId || null;

    if (!internshipId) {
      return responseClient({
        res,
        statusCode: 400,
        message: "internshipId is required",
      });
    }

    if (!profileId) {
      return responseClient({
        res,
        statusCode: 400,
        message: "profileId is required",
      });
    }

    // Ensure internship exists
    const internship = await internshipCollection.findById(internshipId);
    if (!internship?._id) {
      return responseClient({
        res,
        statusCode: 404,
        message: "Internship not found",
      });
    }

    // Prevent duplicate application by same profile to same internship
    const duplicate = await applicationCollection.findOne({
      internshipId,
      profileId,
    });

    if (duplicate && duplicate._id) {
      return responseClient({
        res,
        statusCode: 409,
        message: "You have already applied for this internship",
      });
    }

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
      internshipId: new mongoose.Types.ObjectId(internshipId),
      userId: new mongoose.Types.ObjectId(req.userInfo?._id || req.userInfo),
      profileId: new mongoose.Types.ObjectId(profileId),
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

    // Save application to database
    const application = await applyApplicationModel(applicationData);
    if (!application?._id) {
      return responseClient({
        res,
        message: "something went wrong while submitting the application",
        statusCode: 500,
      });
    }

    // Optionally update user's profile with latest resume URL
    if (documents.resumeUrl) {
      try {
        await updateProfile(req.userInfo._id, {
          resumeUrl: documents.resumeUrl,
        });
      } catch (profileErr) {
        console.error("Failed to update profile resumeUrl", profileErr);
      }
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
// get applications by user controller
export const getApplicationsByUserController = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!req.userInfo) {
      return responseClient({
        res,
        statusCode: 401,
        message: "Unauthorized",
      });
    }

    // Use the authenticated user's id to fetch applications.
    // This avoids mismatches when the frontend accidentally sends the profile id or an object.
    const authUserId = req.userInfo._id.toString();
    if (userId && userId !== authUserId) {
      console.warn(
        `Warning: requested userId ${userId} does not match token user ${authUserId}. Using token id.`
      );
    }

    const applications = await getApplicationsByUserModel(authUserId);

    // Ensure internshipId is populated (has title) for each application; if not, fetch the full internship document

    return responseClient({
      res,
      message: "Applications fetched successfully",
      payload: applications,
    });
  } catch (error) {
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
      profileId: updatedApplication.profileId._id,
      type: "application_update",
      subject: "Application status updated",
      body: `Your application status is ${status}`,
      referenceId: updatedApplication._id,
      referenceModel: "Application",
    };
    await createNotification(notificationData);

    // notify user using socket
    const io = req.app.get("io"); // get socket.io instance

    if (updatedApplication.profileId?.authId) {
      io.to(updatedApplication.profileId.authId.toString()).emit(
        "applicationStatusUpdated",
        {
          applicationId: id,
          newStatus: status,
          message: `Your application status changed to ${status}`,
        }
      );
    }

    return responseClient({
      res,
      message: "Application status updated successfully",
    });
  } catch (error) {
    next(error);
  }
};
