import { v2 as cloudinary } from "cloudinary";
import path from "path";
import fs from "fs";

const uploadToCloudinary = async (filePath, folder = "applications") => {
  try {
    const ext = path.extname(filePath).toLowerCase();

    let resourceType = "image"; // default

    // PDFs, ZIPs, DOCXs → raw
    if ([".pdf", ".zip", ".doc", ".docx", ".txt"].includes(ext)) {
      resourceType = "raw";
    }

    // Videos → video
    if ([".mp4", ".mov", ".avi"].includes(ext)) {
      resourceType = "video";
    }

    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: resourceType,
      filename_override: path.basename(filePath),
      access_mode: "public", // Ensure files are publicly accessible
      use_filename: true,
      unique_filename: false,
    });

    // Clean up the temporary file after successful upload
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    return {
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: resourceType,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    // Clean up the temporary file even if upload fails
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    throw error;
  }
};
export default uploadToCloudinary;
