import mongoose from "mongoose";

export interface IFile extends mongoose.Document {
  name: string;
  key: string;
  size: number;
  userId: mongoose.Types.ObjectId;
  isFolder: boolean;
  parent: mongoose.Types.ObjectId | null;
}

const fileSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    key: { type: String, required: true },
    size: { type: Number, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isFolder: { type: Boolean, default: false },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "File",
      default: null,
    },
    mimeType: { type: String },
    tags: [String],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

fileSchema.index({ name: "text", tags: "text" });

const File = mongoose.model("File", fileSchema);

export default File;
