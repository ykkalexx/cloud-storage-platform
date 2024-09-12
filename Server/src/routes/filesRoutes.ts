import {
  deleteFileController,
  getFileController,
  listFilesController,
  uploadFileController,
} from "controllers/fileControllers";
import express from "express";

export const filesRouter = express.Router();

filesRouter.post("/upload", uploadFileController);
filesRouter.get("/download/:id", getFileController);
filesRouter.get("/list", listFilesController);
filesRouter.delete("/delete/:id", deleteFileController);
