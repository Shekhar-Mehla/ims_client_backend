import applicationCollection from "./applicationSchema.js";
import internshipCollection from "../Intership/internshipSchema.js";
// apply application model
export const applyApplicationModel = (applicationData) => {
  return applicationCollection(applicationData).save();
};

// get applications by user (populate only necessary fields for performance)
export const getApplicationsByUserModel = (userId) => {
  return applicationCollection
    .find({ userId })
    .populate({
      path: "internshipId",
      select: "title company location stipend slug",
      model: "Internship"
    });
};

// get single application by ID with full population
export const getApplicationByIdModel = (id) => {
  return applicationCollection
    .findById(id)
    .populate("internshipId")
    .populate("profileId");
};
// get all applications model (populate key fields)
export const getAllApplicationsModel = () =>
  applicationCollection
    .find()
    .populate("internshipId", "title company postedByName slug")
    .populate("profileId", "fName lName authId");

//update application status model
export const updateApplicationStatusModel = (id, status) =>
  applicationCollection
    .findByIdAndUpdate(id, { status }, { new: true })
    .populate("profileId");
