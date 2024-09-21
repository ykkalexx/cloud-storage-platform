import mongoose from "mongoose";
import crypto from "crypto";
import { IFile } from "./File";

export interface IPublicLink extends mongoose.Document {
  fileId: IFile;
  ownerId: mongoose.Types.ObjectId;
  token: string;
  expiresAt: Date;
  downloads: number;
}

const publicLinkSchema = new mongoose.Schema(
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
    token: {
      type: String,
      unique: true,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    downloads: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

publicLinkSchema.pre("save", function (next) {
  if (!this.token) {
    this.token = crypto.randomBytes(32).toString("hex");
  }
  next();
});

const PublicLink = mongoose.model("PublicLink", publicLinkSchema);

export default PublicLink;
