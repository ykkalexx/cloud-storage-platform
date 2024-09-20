import { getPublicFile } from "controllers/publicLinkControllers";
import express from "express";

export const publicRoutes = express.Router();

publicRoutes.get("/file/:token", getPublicFile);
