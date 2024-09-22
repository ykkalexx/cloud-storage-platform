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
  getAllPublicLinks,
  revokedPublicLink,
} from "controllers/publicLinkControllers";
import {
  getSharedFiles,
  shareFileController,
} from "controllers/shareControllers";
import express from "express";
import { authenticateToken } from "middleware/auth";
import multer from "multer";
import rateLimit from "express-rate-limit";

// Create a rate limiter middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});

export const filesRouter = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

filesRouter.post(
  "/upload",
  apiLimiter,
  authenticateToken,
  upload.single("file"),
  uploadFileController
);
filesRouter.get(
  "/download/:id",
  apiLimiter,
  authenticateToken,
  getFileController
);
filesRouter.get("/list", apiLimiter, authenticateToken, listFilesController);
filesRouter.delete(
  "/delete/:id",
  apiLimiter,
  authenticateToken,
  deleteFileController
);
filesRouter.post(
  "/upload-chunk",
  apiLimiter,
  authenticateToken,
  upload.single("chunk"),
  uploadChunkController
);
filesRouter.post(
  "/complete-upload",
  apiLimiter,
  authenticateToken,
  completeUploadController
);
filesRouter.post("/folder", apiLimiter, authenticateToken, createFolder);
filesRouter.get(
  "/contents/:folderId?",
  apiLimiter,
  authenticateToken,
  getContents
);
filesRouter.post("/move", apiLimiter, authenticateToken, moveFile);
filesRouter.post("/rename", apiLimiter, authenticateToken, renameFileOrFolder);
filesRouter.post(
  "/public-link",
  apiLimiter,
  authenticateToken,
  createPublicLink
);
filesRouter.delete(
  "/public-link/:linkId",
  apiLimiter,
  authenticateToken,
  revokedPublicLink
);
filesRouter.get(
  "/public-links",
  apiLimiter,
  authenticateToken,
  getAllPublicLinks
);
