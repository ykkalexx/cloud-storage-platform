import { Request, Response } from "express";
import { uploadFile, getFileUrl, deleteFile } from "services/S3Service";
import File from "models/File";

export const uploadFileController = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).send("No file provided");
    }

    const key = await uploadFile(req.file, req.user!._id);

    const file = new File({
      name: req.file.originalname,
      key: key,
      size: req.file.size,
      userId: req.user!._id,
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
    const files = await File.find({ userId: req.user!._id });
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

    if (file.userId.toString() !== req.user!._id) {
      return res.status(403).send("Unauthorized");
    }

    await deleteFile(file.key);
    await file.remove();

    res.send("File deleted successfully");
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};
