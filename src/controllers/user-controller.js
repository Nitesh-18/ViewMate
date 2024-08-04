import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user-model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { jwt } from "jsonwebtoken";
import { upload } from "../middlewares/multer.js";

const generateAccessandRefreshToken = async (UserId) => {
  try {
    const user = await User.findById(UserId).select("+password");
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforesave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "Failed to generate token");
  }
};

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

const loginUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if (!username && !email) {
    throw new ApiError(400, "Username or Email are required");
  }

  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!existedUser) {
    throw new ApiError(404, "Invalid Email or Username");
  }

  const isValidPassword = await existedUser.isPasswordCorrect(password);

  if (!isValidPassword) {
    throw new ApiError(401, "Invalid User Credentials!");
  }

  try {
    const accessToken = existedUser.generateAccessToken();
    const refreshToken = existedUser.generateRefreshToken();

    const loggedInUser = await User.findById(existedUser._id).select(
      "-password -refreshToken"
    );

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    };

    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json({
        response: new ApiResponse(
          200,
          loggedInUser,
          "User Logged In Successfully!"
        ),
      });
  } catch (error) {
    console.error("Error during login:", error);
    throw new ApiError(500, "Failed to generate token");
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    { $set: { refreshToken: null } },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  res
    .status(200)
    .clearCookie("refreshToken", options)
    .clearCookie("accessToken", options)
    .json(new ApiResponse(200, {}, "User Logged Out"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) throw new ApiError(401, "Unauthorised Request");
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) throw new ApiError(401, "Invalid Refresh Token");
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh Token used or expired !");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newRefreshToken } =
      await generateAccessandRefreshToken(user._id);
    res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Access Token Refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, "Invalid Refresh Token");
  }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body; // Confirm Password can be taken as an inpput and checked with the newPassword
  const user = await User.findById(req.user._id);
  const isValidPassword = await user.isPasswordCorrect(oldPassword);
  if (!isValidPassword) {
    throw new ApiError(400, "Invalid Old Password");
  }
  user.password = newPassword;
  await user.save({ validateBeforesave: false });
  return res.json(new ApiResponse(200, {}, "Password Changed"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(200, req.user, "Current User fetched Successfully !");
});

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullname, email } = req.body;
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        fullname: fullname,
        email,
      },
    },
    { new: true }
  ).select("-password");
  return res.json(new ApiResponse(200, user, "Account Details Updated"));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) throw new ApiError(400, "Avatar File is missing");
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url)
    throw new ApiError(400, "Error while uploading Avatar File on Cloudinary");
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");
  return res.json(new ApiResponse(200, {}, "Avatar Updated"));
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
  const coverImageLocalPath = req.file?.path;

  if (!coverImageLocalPath) throw new ApiError(400, "Cover Image File is missing");
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!coverImage.url)
    throw new ApiError(400, "Error while uploading Cover Image File on Cloudinary");
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        coverImage: coverImage.url,
      },
    },
    {
      new: true,
    }
  ).select("-password");
  return res.json(new ApiResponse(200, {}, "Cover Image Updated"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changeCurrentPassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  updateUserCoverImage
};
