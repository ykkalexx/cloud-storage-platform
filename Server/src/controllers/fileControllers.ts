import { Request, Response } from "express";
import {
  uploadFile,
  getFileUrl,
  deleteFile,
  uploadFileChunk,
  reassembleFile,
} from "services/S3Service";
import File from "models/File";
import { IUser } from "models/User";

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

    const { chunkIndex, totalChunks, fileName } = req.body;
    const user = req.user as IUser;

    console.log(
      `Uploading chunk ${chunkIndex} of ${totalChunks} for file ${fileName}`
    );

    const buffer = req.file.buffer;
    console.log(`Buffer type: ${typeof buffer}`);
    console.log(`Buffer isBuffer: ${Buffer.isBuffer(buffer)}`);
    console.log(`Buffer size: ${buffer ? buffer.length : "undefined"}`);

    if (!buffer || !Buffer.isBuffer(buffer)) {
      throw new Error("Invalid buffer provided");
    }

    const key = await uploadFileChunk(
      buffer,
      fileName,
      parseInt(chunkIndex),
      user.id.toString()
    );

    console.log(
      `Chunk ${chunkIndex} uploaded with key ${key} and size ${buffer.length}`
    );

    res.status(200).json({ message: "Chunk uploaded successfully", key });
  } catch (error) {
    console.error("Error uploading chunk:", error);
    res.status(500).json({ message: "Error uploading chunk" });
  }
};

export const completeUploadController = async (req: Request, res: Response) => {
  try {
    const { fileName, totalChunks } = req.body;
    const user = req.user as IUser;

    console.log(`Reassembling file ${fileName} from ${totalChunks} chunks`);

    // Reassemble the file from the chunks
    const fileKey = `${user.id.toString()}/${fileName}`;
    const fileSize = await reassembleFile(fileKey, parseInt(totalChunks));

    console.log(`Reassembled file size: ${fileSize}`);

    // Create file record in database
    const file = new File({
      name: fileName,
      key: fileKey,
      size: fileSize,
      userId: user.id.toString(),
    });

    await file.save();

    res
      .status(201)
      .json({ message: "File uploaded successfully", fileId: file._id });
  } catch (error) {
    console.error("Error completing upload:", error);
    res.status(500).json({ message: "Error completing upload" });
  }
};
