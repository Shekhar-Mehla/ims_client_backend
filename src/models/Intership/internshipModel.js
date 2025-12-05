import internshipCollection from "./internshipSchema.js";

// Create new internship


// Get all internships
export const getAllIntership = async () => {
  try {
    const internships = await internshipCollection
      .find({ status: "active" })
      .populate("postedBy", "email")
      .sort({ createdAt: -1 });
    return internships;
  } catch (error) {
    console.error("Error getting all internships:", error);
    throw error;
  }
};

// Get internship by slug
export const getIntershipDetailBySlug = async (slug) => {
  try {
    const internship = await internshipCollection
      .findOne({ slug, status: "active" })
      .populate("postedBy", "email");
    return internship;
  } catch (error) {
    console.error("Error getting internship by slug:", error);
    throw error;
  }
};

// Update internship by ID
export const updateInternshipById = async (id, updateData) => {
  try {
    const updatedInternship = await internshipCollection
      .findByIdAndUpdate(id, updateData, { new: true })
      .populate("postedBy", "email");
    return updatedInternship;
  } catch (error) {
    console.error("Error updating internship:", error);
    throw error;
  }
};

// Delete internship by ID
export const deleteInternshipById = async (id) => {
  try {
    const deletedInternship = await internshipCollection.findByIdAndDelete(id);
    return deletedInternship;
  } catch (error) {
    console.error("Error deleting internship:", error);
    throw error;
  }
};

// Get internships by user
export const getInternshipsByUser = async (userId) => {
  try {
    const internships = await internshipCollection
      .find({ postedBy: userId })
      .sort({ createdAt: -1 });
    return internships;
  } catch (error) {
    console.error("Error getting internships by user:", error);
    throw error;
  }
};
