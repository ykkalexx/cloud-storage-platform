import {
  googleAuth,
  googleAuthCallback,
  login,
  register,
  verify,
} from "controllers/authControllers";
import express from "express";
import { authenticateToken } from "middleware/auth";

export const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/verify", authenticateToken, verify);
authRouter.get("/google", googleAuth);
authRouter.get("/google/callback", googleAuthCallback);
