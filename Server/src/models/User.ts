import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String, // Google users will have this ID
      required: false,
    },
    username: {
      type: String,
      required: true, // Required for both Google and local users
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.googleId; // Password is required only if googleId is not present (i.e., for local users)
      },
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  { timestamps: true }
); // Automatically adds createdAt and updatedAt fields

const User = mongoose.model("User", userSchema);

export default User;
