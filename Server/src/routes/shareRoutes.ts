import {
  shareFileController,
  getSharedFiles,
} from "controllers/shareControllers";
import express from "express";
import { authenticateToken } from "middleware/auth";

export const shareRouter = express.Router();

shareRouter.post("/share", authenticateToken, shareFileController);
shareRouter.get("/shared", authenticateToken, getSharedFiles);
