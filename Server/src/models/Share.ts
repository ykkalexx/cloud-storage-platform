import mongoose from "mongoose";

const shareSchema = new mongoose.Schema(
  {
    fileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      required: true,
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sharedWith: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    permission: { type: String, enum: ["read", "write"], default: "read" },
  },
  { timestamps: true }
);

const Share = mongoose.model("Share", shareSchema);

export default Share;
