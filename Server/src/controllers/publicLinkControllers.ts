import { Request, Response } from "express";
import PublicLink, { IPublicLink } from "../models/PublicLink";
import File from "../models/File";
import { IUser } from "models/User";
import { GetSignedUrl } from "services/S3Service";
import { v4 as uuidv4 } from "uuid";

export const createPublicLink = async (req: Request, res: Response) => {
  try {
    const { fileId, expiresIn } = req.body;
    const owner = req.user as IUser;
    const ownerId = owner.id.toString();

    const file = await File.findOne({ _id: fileId });
    if (!file) {
      return res
        .status(404)
        .json({ message: "File not found or you do not have permission" });
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresIn);

    const token = uuidv4();

    const publicLink = new PublicLink({
      fileId,
      ownerId,
      expiresAt,
      token,
    });

    await publicLink.save();

    res.status(201).json({
      message: "Public link created successfully",
      link: `${process.env.API_URL}/public/file/${publicLink.token}`,
    });
  } catch (error) {
    console.error("Error creating public link:", error);
    res.status(500).json({ message: "Error creating public link" });
  }
};

export const getPublicFile = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const publicLink = await PublicLink.findOne({ token }).populate("fileId");

    if (!publicLink || publicLink.expiresAt < new Date()) {
      return res.status(404).json({ message: "Invalid or expired link" });
    }

    if (!(publicLink.fileId instanceof File)) {
      return res.status(500).json({ message: "Error getting file" });
    }

    publicLink.downloads += 1;
    await publicLink.save();

    const fileUrl = await GetSignedUrl(publicLink.fileId.key);
    res.json({ fileUrl });
  } catch (error) {
    console.error("Error getting public file:", error);
    res.status(500).json({ message: "Error getting public file" });
  }
};

export const revokedPublicLink = async (req: Request, res: Response) => {
  try {
    const { linkId } = req.params;
    const owner = req.user as IUser;
    const ownerId = owner.id.toString();

    const publicLink = await PublicLink.findOne({ _id: linkId, ownerId });
    if (!publicLink) {
      return res.status(404).json({
        message: "Public link not found or you do not have permission",
      });
    }

    await publicLink.deleteOne();
    res.json({ message: "Public link revoked successfully" });
  } catch (error) {
    console.error("Error revoking public link:", error);
    res.status(500).json({ message: "Error revoking public link" });
  }
};

export const getAllPublicLinks = async (req: Request, res: Response) => {
  try {
    const owner = req.user as IUser;
    const ownerId = owner.id.toString();

    const publicLinks = await PublicLink.find({ ownerId }).populate("fileId");
    res.json(publicLinks);
  } catch (error) {
    console.error("Error getting public links:", error);
    res.status(500).json({ message: "Error getting public links" });
  }
};
