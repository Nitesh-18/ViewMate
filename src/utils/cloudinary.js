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
    //Upload the file on Cloudinary
    const reponse = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("FFile has been uploaded successfully !", reponse.url);
    return reponse;
  } catch (error) {
    fs.unlinkSync(localFilePath); //Remove the locally saved temprory file since the upload operation got failed
    return null;
  }
};

export {uploadOnCloudinary};
