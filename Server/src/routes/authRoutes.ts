import { login, register } from "controllers/authControllers";
import express from "express";
import { authenticateToken } from "middleware/auth";

export const authRouter = express.Router();

authRouter.post("/register", authenticateToken, register);
authRouter.post("/login", authenticateToken, login);
