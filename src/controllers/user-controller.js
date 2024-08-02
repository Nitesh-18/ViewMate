import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

const registerUser = asyncHandler(async (req, res) => {
  const { fullname, username, email, password } = req.body;
  console.log("username:", username);
  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "Please fill in all fields");
  }
});

export { registerUser };
