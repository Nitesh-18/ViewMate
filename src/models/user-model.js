import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      lowercase: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      lowercase: true,
    },
    fullname: {
      type: String,
      index: true,
      required: true,
      trim: true,
    },
    avatar: {
      type: String,
      default: "https://res.cloudinary.com/dqyjwzg5k/image",
      upload: {
        type: String,
        required: true,
      },
    },
    coverImage: {
      type: String,
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: true,
      minlength: 3,
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  try {
    const token = jwt.sign(
      {
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      }
    );
    console.log("Access token generated successfully:", token);
    return token;
  } catch (error) {
    console.error("Error generating access token:", error);
    throw new ApiError(500, "Failed to generate access token");
  }
};

userSchema.methods.generateRefreshToken = function () {
  try {
    const token = jwt.sign(
      {
        _id: this._id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      }
    );
    console.log("Refresh token generated successfully:", token);
    return token;
  } catch (error) {
    console.error("Error generating refresh token:", error);
    throw new ApiError(500, "Failed to generate refresh token");
  }
};

export const User = mongoose.model("User", userSchema);
