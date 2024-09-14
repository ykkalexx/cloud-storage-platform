import mongoose from "mongoose";

const incompleteUploadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    fileName: { type: String, required: true },
    chunkCount: { type: Number, required: true },
    uploadedChunks: [Number],
    startedAt: { type: Date, default: Date.now },
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const IncompleteUpload = mongoose.model(
  "IncompleteUpload",
  incompleteUploadSchema
);

export default IncompleteUpload;
