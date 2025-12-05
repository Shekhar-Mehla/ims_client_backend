import mongoose from "mongoose";

const internshipSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    technologies: [
      {
        type: String,
        trim: true,
      },
    ],
    sectors: [
      {
        type: String,
        trim: true,
      },
    ],
    roles: [
      {
        type: String,
        trim: true,
      },
    ],
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
      required: true,
    },
    postedByName: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "expired"],
      default: "active",
    },
    applicationCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better performance
internshipSchema.index({ slug: 1 });
internshipSchema.index({ postedBy: 1 });
internshipSchema.index({ status: 1 });

const internshipCollection = mongoose.model("Internship", internshipSchema);
export default internshipCollection;
