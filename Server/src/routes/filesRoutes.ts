import {
  completeUploadController,
  deleteFileController,
  getFileController,
  listFilesController,
  moveFile,
  renameFileOrFolder,
  uploadChunkController,
  uploadFileController,
} from "controllers/fileControllers";
import { createFolder, getContents } from "controllers/folderControllers";
import {
  createPublicLink,
  revokedPublicLink,
} from "controllers/publicLinkControllers";
import {
  getSharedFiles,
  shareFileController,
} from "controllers/shareControllers";
import express from "express";
import { authenticateToken } from "middleware/auth";
import multer from "multer";

export const filesRouter = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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
filesRouter.post("/folder", authenticateToken, createFolder);
filesRouter.get("/contents/:folderId?", authenticateToken, getContents);
filesRouter.post("/move", authenticateToken, moveFile);
filesRouter.post("/rename", authenticateToken, renameFileOrFolder);
filesRouter.post("/public-link", authenticateToken, createPublicLink);
filesRouter.delete(
  "/public-link/:linkId",
  authenticateToken,
  revokedPublicLink
);
