import { searchFilesController } from "controllers/searchControllers";
import express from "express";
import { authenticateToken } from "middleware/auth";

export const searchRoutes = express.Router();

searchRoutes.get("/search", authenticateToken, searchFilesController);
