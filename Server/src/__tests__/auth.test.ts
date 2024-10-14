import {
  register,
  login,
  verify,
  googleAuthCallback,
  refreshToken,
  logout,
} from "../controllers/authControllers";
import { Request, Response } from "express";
import User from "models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// Mocking dependencies
jest.mock("models/User");
jest.mock("bcrypt");
jest.mock("jsonwebtoken");

// Helper function to create mock response
const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  return res;
};

describe("Auth Controller", () => {
  describe("register", () => {
    it("should return 400 if user already exists", async () => {
      const req = { body: { email: "test@example.com" } } as Request;
      const res = mockResponse();
      (User.findOne as jest.Mock).mockResolvedValue(true);

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "User already exists" });
    });

    it("should return 201 if user is successfully registered", async () => {
      const req = {
        body: {
          username: "testuser",
          email: "test@example.com",
          password: "password123",
        },
      } as Request;
      const res = mockResponse();
      (User.findOne as jest.Mock).mockResolvedValue(null);
      (bcrypt.genSalt as jest.Mock).mockResolvedValue("salt");
      (bcrypt.hash as jest.Mock).mockResolvedValue("hashedPassword");
      (User.prototype.save as jest.Mock).mockResolvedValue(true);

      await register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "User registered successfully",
      });
    });
  });

  describe("login", () => {
    it("should return 400 if user does not exist", async () => {
      const req = {
        body: { email: "test@example.com", password: "password123" },
      } as Request;
      const res = mockResponse();
      (User.findOne as jest.Mock).mockResolvedValue(null);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
    });

    it("should return 400 if password is incorrect", async () => {
      const req = {
        body: { email: "test@example.com", password: "wrongpassword" },
      } as Request;
      const res = mockResponse();
      (User.findOne as jest.Mock).mockResolvedValue({
        password: "hashedPassword",
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await login(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "Invalid credentials" });
    });

    it("should return 200 and set cookies if login is successful", async () => {
      const req = {
        body: { email: "test@example.com", password: "password123" },
      } as Request;
      const res = mockResponse();
      (User.findOne as jest.Mock).mockResolvedValue({
        _id: "userId",
        password: "hashedPassword",
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue("fakeToken");

      await login(req, res);

      expect(res.cookie).toHaveBeenCalledWith(
        "accessToken",
        "fakeToken",
        expect.any(Object)
      );
      expect(res.cookie).toHaveBeenCalledWith(
        "refreshToken",
        "fakeToken",
        expect.any(Object)
      );
      expect(res.json).toHaveBeenCalledWith({
        message: "Logged in successfully",
      });
    });
  });

  describe("verify", () => {
    it("should return 403 if token is missing", async () => {
      const req = { cookies: {} } as Request;
      const res = mockResponse();

      await verify(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        message: "Authorization denied",
      });
    });
  });

  describe("logout", () => {
    it("should clear cookies and return 200 on logout", () => {
      const req = {} as Request;
      const res = mockResponse();

      logout(req, res);

      expect(res.cookie).toHaveBeenCalledWith("accessToken", "", { maxAge: 0 });
      expect(res.cookie).toHaveBeenCalledWith("refreshToken", "", {
        maxAge: 0,
      });
      expect(res.json).toHaveBeenCalledWith({
        message: "Logged out successfully",
      });
    });
  });
});
