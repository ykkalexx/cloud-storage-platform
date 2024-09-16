import { PutObjectCommand } from "@aws-sdk/client-s3";
import { Request, Response } from "express";
import File from "models/File";
import { IUser } from "models/User";
import { s3Client } from "services/S3Service";

export const createFolder = async (req: Request, res: Response) => {
  try {
    const { name, parentId } = req.body;
    const user = req.user as IUser;
    const userId = user.id.toString();

    // Create folder key in S3 (with trailing slash)
    const folderKey = parentId
      ? `${userId}/${parentId}/${name}/`
      : `${userId}/${name}/`;

    // Upload an empty object to S3 to represent the folder
    const uploadParams = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: folderKey,
      Body: "", // Empty body since it's a folder
    });

    try {
      await s3Client.send(uploadParams);
      console.log(`Folder created in S3 with key: ${folderKey}`);
    } catch (s3Error) {
      console.error("Error creating folder in S3:", s3Error);
      return res.status(500).json({ message: "Error creating folder in S3" });
    }

    // Create folder entry in the database
    const newFolder = new File({
      name,
      key: folderKey,
      size: 0, // Folders don't have size
      userId,
      isFolder: true,
      parent: parentId || null,
    });

    await newFolder.save();

    res
      .status(201)
      .json({ message: "Folder created successfully", folder: newFolder });
  } catch (error) {
    console.error("Error creating folder:", error);
    res.status(500).json({ message: "Error creating folder" });
  }
};

export const getContents = async (req: Request, res: Response) => {
  try {
    const { folderId } = req.params;
    const user = req.user as IUser;
    const userId = user.id.toString();

    const contents = await File.find({
      userId,
      parent: folderId || null,
    }).sort({ isFolder: -1, name: 1 });

    res.json({ contents });
  } catch (error) {
    console.error("Error getting folder contents:", error);
    res.status(500).json({ message: "Error getting folder contents" });
  }
};
