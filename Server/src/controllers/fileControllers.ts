import { Request, Response } from "express";
import {
  uploadFile,
  getFileUrl,
  deleteFile,
  uploadFileChunk,
  reassembleFile,
  moveFileInS3,
  renameFileInS3,
} from "services/S3Service";
import File from "models/File";
import { IUser } from "models/User";
import IncompleteUpload from "models/IncompleteUpload";
import Share from "models/Share";

const generateTags = (name: string, mimeType: string): string[] => {
  const nameTags = name.split(/\s+/).map((tag) => tag.toLowerCase());
  const mimeTypeTags = mimeType.split("/").map((tag) => tag.toLowerCase());
  return [...new Set([...nameTags, ...mimeTypeTags])];
};

/* 
This is the old upload file controller, created before the chunked upload feature was implemented.
It is no longer needed and can be removed.
*/
export const uploadFileController = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file provided");
    }

    if (!req.user) {
      return res.status(401).send("User not authenticated");
    }

    const user = req.user as IUser;
    console.log(user);

    // Upload the file to S3
    const key = await uploadFile(req.file, user.id.toString());

    // Save file metadata to the database
    const file = new File({
      name: req.file.originalname,
      key: key,
      size: req.file.size,
      userId: user.id,
    });

    await file.save();

    res
      .status(201)
      .json({ message: "File uploaded successfully", fileId: file._id });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

export const getFileController = async (req: Request, res: Response) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).send("File not found");
    }

    const user = req.user as IUser;
    const userId = user.id.toString();

    const hasAccess =
      file.userId.equals(userId) ||
      (await Share.exists({ file, sharedWith: userId }));

    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied" });
    }

    const url = await getFileUrl(file.key);
    res.json({ url });
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

export const listFilesController = async (req: Request, res: Response) => {
  try {
    const user = req.user as IUser;

    const files = await File.find({ userId: user.id });
    res.json(files);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

export const deleteFileController = async (req: Request, res: Response) => {
  try {
    const file = await File.findById(req.params.id);

    if (!file) {
      return res.status(404).send("File not found");
    }

    const user = req.user as IUser;

    if (file.userId.toString() !== user.id.toString()) {
      return res.status(403).send("Unauthorized");
    }

    // Delete the file from S3
    await deleteFile(file.key);

    // Delete the file from the database
    await File.findByIdAndDelete(req.params.id);

    res.send("File deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

export const uploadChunkController = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file provided" });
    }

    const { chunkIndex, totalChunks, fileName, parentId } = req.body;
    const user = req.user as IUser;

    const buffer = req.file.buffer;

    if (!buffer || !Buffer.isBuffer(buffer)) {
      throw new Error("Invalid buffer provided");
    }

    let key = `${user.id.toString()}/${fileName}/chunk-${chunkIndex}`;
    if (parentId) {
      const parentFolder = await File.findOne({
        _id: parentId,
        userId: user.id.toString(),
        isFolder: true,
      });
      if (!parentFolder) {
        return res.status(404).json({ message: "Parent folder not found" });
      }
      key = `${parentFolder.key}${fileName}/chunk-${chunkIndex}`;
    }

    await uploadFileChunk(
      buffer,
      fileName,
      parseInt(chunkIndex),
      user.id.toString()
    );

    await IncompleteUpload.findOneAndUpdate(
      { userId: user.id.toString(), fileName },
      {
        $set: { chunkCount: parseInt(totalChunks), lastUpdated: new Date() },
        $addToSet: { uploadedChunks: parseInt(chunkIndex) },
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "Chunk uploaded successfully", key });
  } catch (error) {
    console.error("Error uploading chunk:", error);
    res.status(500).json({ message: "Error uploading chunk" });
  }
};

export const completeUploadController = async (req: Request, res: Response) => {
  try {
    const { fileName, totalChunks, parentId } = req.body;
    const user = req.user as IUser;

    // Check if all chunks are uploaded
    const incompleteUpload = await IncompleteUpload.findOne({
      userId: user.id.toString(),
      fileName,
    });
    if (
      !incompleteUpload ||
      incompleteUpload.uploadedChunks.length !== parseInt(totalChunks)
    ) {
      return res.status(400).json({ message: "Upload is incomplete" });
    }

    // Reassemble the file from the chunks
    let fileKey = `${user.id.toString()}/${fileName}`;
    const fileSize = await reassembleFile(fileKey, parseInt(totalChunks));

    // If the file is being uploaded to a folder, update the key
    if (parentId) {
      const parentFolder = await File.findOne({
        _id: parentId,
        userId: user.id.toString(),
        isFolder: true,
      });
      if (!parentFolder) {
        return res.status(404).json({ message: "Parent folder not found" });
      }
      fileKey = `${parentFolder.key}/${fileName}`;
    }

    // Generate tags
    const mimeType = req.body.mimeType || "application/octet-stream";
    const tags = generateTags(fileName, mimeType);

    // Create file record in database
    const file = new File({
      name: fileName,
      key: fileKey,
      size: fileSize,
      userId: user.id.toString(),
      mimeType: mimeType,
      tags: tags,
      parent: parentId || null,
    });

    await file.save();

    // Remove the incomplete upload record
    await IncompleteUpload.findByIdAndDelete(incompleteUpload._id);

    res
      .status(201)
      .json({ message: "File uploaded successfully", fileId: file._id });
  } catch (error) {
    console.error("Error completing upload:", error);
    res.status(500).json({ message: "Error completing upload" });
  }
};

export const moveFile = async (req: Request, res: Response) => {
  try {
    const { fileId, newParentId } = req.body;
    const user = req.user as IUser;
    const userId = user.id.toString();

    const file = await File.findOne({ _id: fileId, userId });
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    let newParentKey = userId;
    let oldParent = file.parent;

    if (newParentId) {
      const newParent = await File.findOne({
        _id: newParentId,
        userId,
        isFolder: true,
      });

      if (!newParent) {
        return res
          .status(404)
          .json({ message: "Destination folder not found" });
      }

      // Construct the new parent key (folder path)
      newParentKey = newParent.key;
    }

    const oldKey = file.key;
    const newKey = `${newParentKey}${file.name}`.replace(/\\/g, "/");

    console.log(`Old Key: ${oldKey}, New Key: ${newKey}`);

    // If the file is not being moved to a new location, skip the S3 move
    if (oldKey === newKey) {
      return res
        .status(400)
        .json({ message: "File is already in the selected location" });
    }

    // Move the file in S3 if it's not a folder
    if (!file.isFolder) {
      await moveFileInS3(oldKey, newKey);
    }

    // Update the file key and parent in the database
    file.key = newKey;
    file.parent = newParentId || null;
    await file.save();

    res.json({ message: "File moved successfully" });
  } catch (error) {
    console.error("Error moving file:", error);
    res.status(500).json({ message: "Error moving file" });
  }
};

export const renameFileOrFolder = async (req: Request, res: Response) => {
  try {
    const { id, newName } = req.body;
    const user = req.user as IUser;
    const userId = user.id.toString();

    const file = await File.findOne({ _id: id, userId });
    if (!file) {
      return res.status(404).json({ message: "File not found" });
    }

    // Check if a file/folder with the new name already exists in the same directory
    const existingFile = await File.findOne({
      name: newName,
      parent: file.parent,
      userId,
      _id: { $ne: file._id },
    });

    if (existingFile) {
      return res
        .status(400)
        .json({ message: "A file or folder with this name already exists" });
    }

    const oldName = file.name;
    file.name = newName;

    // If it's a file (not a folder), update the S3 key
    if (!file.isFolder) {
      const oldKey = file.key;
      const newKey = oldKey.replace(oldName, newName);
      await renameFileInS3(oldKey, newKey);
      file.key = newKey;
    }

    await file.save();

    res.json({ message: "File or folder renamed successfully", file });
  } catch (error) {
    console.error("Error renaming file or folder:", error);
    res.status(500).json({ message: "Error renaming file or folder" });
  }
};
