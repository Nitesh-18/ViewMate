import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user-model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, username, email, password } = req.body;
//   console.log("Request body:", req.body);

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "Please fill in all fields");
  }

  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    throw new ApiError(409, "Username or Email already exist !");
  }

  const avatarLocalPath = req.files?.avatar ? req.files.avatar[0].path : null;
  const coverImageLocalPath = req.files?.coverImage
    ? req.files.coverImage[0].path
    : null;

//   console.log("Avatar local path:", avatarLocalPath);
//   console.log("Cover image local path:", coverImageLocalPath);
//   console.log("Using Cloudinary API Key:", process.env.CLOUDINARY_API_KEY);

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar Image is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = coverImageLocalPath
    ? await uploadOnCloudinary(coverImageLocalPath)
    : null;

//   console.log("Avatar upload result:", avatar);
//   console.log("Cover image upload result:", coverImage);

  if (!avatar) {
    throw new ApiError(400, "Avatar Image is required");
  }

  const newUser = await User.create({
    fullname,
    username: username.toLowerCase(),
    email,
    password, // Ensure password is included
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  const createdUser = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(
      500,
      "Something went wrong while registering the User !"
    );
  }

  return res.status(201).json({
    new: new ApiResponse(200, createdUser, "User Created Successfully !"), // Use 'new' to instantiate ApiResponse
  });
});

export { registerUser };
