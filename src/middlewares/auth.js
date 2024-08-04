import jwt from "jsonwebtoken";
import { User } from "../models/user-model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");
    
    console.log("Token:", token); // Log the token

    if (!token) throw new ApiError(401, "Unauthorized request");

    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    console.log("Decoded Token:", decodedToken); // Log the decoded token

    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken"
    );

    if (!user) throw new ApiError(401, "Invalid Access Token");

    req.user = user;
    next();
  } catch (error) {
    console.error("JWT verification error:", error); // Log the error
    throw new ApiError(401, error.message || "Invalid Access Token");
  }
});
