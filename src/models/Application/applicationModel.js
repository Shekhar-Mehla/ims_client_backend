import applicationCollection from "./applicationSchema.js";
// apply application model
export const applyApplicationModel = (applicationData) => {
  console.log(applicationData);
  return applicationCollection(applicationData).save();
};

// get applications by user (populate only necessary fields for performance)
export const getApplicationsByUserModel = (userId) => {
  console.log(userId, "model.....");
  return applicationCollection.find({ userId }).populate("internshipId");
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
