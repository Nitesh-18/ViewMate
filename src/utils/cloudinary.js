import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    // Upload the file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    console.log("File has been uploaded successfully!", response.url);

    // Remove the locally saved temporary file after successful upload
    try {
      fs.unlinkSync(localFilePath);
    } catch (unlinkError) {
      console.error("Error removing local file:", unlinkError);
    }

    return response;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);

    // Remove the locally saved temporary file since the upload operation failed
    try {
      fs.unlinkSync(localFilePath);
    } catch (unlinkError) {
      console.error(
        "Error removing local file after failed upload:",
        unlinkError
      );
    }

    return null;
  }
};

export { uploadOnCloudinary };
