import mongoose from "mongoose";

const ProfileSchema = new mongoose.Schema(
  {
    fName: { type: String, required: true },
    lName: { type: String, required: true },
    authId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    // Contact & basic info
    countryCode: { type: String, default: "+91" },
    mobile: { type: String, default: null },
    gender: { type: String, default: null },
    dateOfBirth: { type: String, default: null },
    address: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
    pincode: { type: String, default: null },

    // Education & skills
    educationLevel: { type: String, default: null },
    institutionName: { type: String, default: null },
    degree: { type: String, default: null },
    fieldOfStudy: { type: String, default: null },
    graduationYear: { type: String, default: null },
    cgpa: { type: String, default: null },
    skills: { type: String, default: null },

    // Links
    linkedinUrl: { type: String, default: null },
    portfolioUrl: { type: String, default: null },
    githubUrl: { type: String, default: null },

    // Existing fields
    avatarUrl: { type: String, default: null },
    resumeUrl: { type: String, default: null },
    technologies: [{ type: String }],
    sectors: [{ type: String }],
    roles: [{ type: String }],
  },
  { timestamps: true }
);

const profileCollection = mongoose.model("Profile", ProfileSchema);
export default profileCollection;
