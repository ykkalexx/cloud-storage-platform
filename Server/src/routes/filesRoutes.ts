import {
  completeUploadController,
  deleteFileController,
  getFileController,
  listFilesController,
  uploadChunkController,
  uploadFileController,
} from "controllers/fileControllers";
import express from "express";
import { authenticateToken } from "middleware/auth";
import multer from "multer";

export const filesRouter = express.Router();
const upload = multer({ dest: "uploads/" });

filesRouter.post(
  "/upload",
  authenticateToken,
  upload.single("file"),
  uploadFileController
);
filesRouter.get("/download/:id", authenticateToken, getFileController);
filesRouter.get("/list", authenticateToken, listFilesController);
filesRouter.delete("/delete/:id", authenticateToken, deleteFileController);
filesRouter.post(
  "/upload-chunk",
  authenticateToken,
  upload.single("chunk"),
  uploadChunkController
);
filesRouter.post(
  "/complete-upload",
  authenticateToken,
  completeUploadController
);
