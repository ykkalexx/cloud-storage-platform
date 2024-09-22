import {
  googleAuth,
  googleAuthCallback,
  login,
  logout,
  register,
  verify,
} from "controllers/authControllers";
import express from "express";
import { authenticateToken } from "middleware/auth";
import rateLimit from "express-rate-limit";

// Create a rate limiter middleware
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again after 15 minutes",
});

export const authRouter = express.Router();

authRouter.post("/register", apiLimiter, register);
authRouter.post("/login", apiLimiter, login);
authRouter.get("/verify", apiLimiter, authenticateToken, verify);
authRouter.get("/google", apiLimiter, googleAuth);
authRouter.get("/google/callback", apiLimiter, googleAuthCallback);
authRouter.post("/logout", apiLimiter, logout);
