import { Request, Response } from "express";
import Share from "../models/Share";
import File from "../models/File";
import User, { IUser } from "../models/User";
import { getIO } from "websockets/socketManager";

export const shareFileController = async (req: Request, res: Response) => {
  try {
    console.log("hit shareFile");
    const { fileId, sharedWithEmail, permission } = req.body;
    const user = req.user as IUser;
    const ownerId = user.id.toString();

    console.log(`fileId: ${fileId}, ownerId: ${ownerId}`);

    const file = await File.findOne({ _id: fileId });
    console.log("file: ", file);
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    const sharedWithUser = await User.findOne({ email: sharedWithEmail });
    if (!sharedWithUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const existingShare = await Share.findOne({
      fileId,
      sharedWith: sharedWithUser._id,
    });
    if (existingShare) {
      return res
        .status(400)
        .json({ message: "File already shared with this user" });
    }

    const newShare = new Share({
      fileId,
      ownerId,
      sharedWith: sharedWithUser._id,
      permission,
    });

    await newShare.save();

    const username = user.username;

    // Emit WebSocket event for real-time notification
    const io = getIO();
    io.to(sharedWithUser._id.toString()).emit("new_share", {
      fileId: file._id,
      fileName: file.name,
      sharedBy: username,
    });

    res.status(201).json({ message: "File shared successfully" });
  } catch (error) {
    console.error("Error sharing file:", error);
    res.status(500).json({ message: "Error sharing file" });
  }
};

export const getSharedFiles = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;
    const userId = user.id.toString();

    const sharedFiles = await Share.find({ sharedWith: userId })
      .populate("fileId")
      .populate("ownerId", "username email");

    res.status(200).json({ sharedFiles });
  } catch (error) {
    console.error("Error getting shared files:", error);
    res.status(500).json({ message: "Error getting shared files" });
  }
};
