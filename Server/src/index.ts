import express from "express";
import dotenv from "dotenv";
import { authRouter } from "./routes/authRoutes";
import mongoose from "mongoose";
import http from "http";
import cors from "cors";
import { Request, Response, NextFunction } from "express";
import { connectToDB } from "config/database";
import cookieParser from "cookie-parser";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: true,
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

app.use("/auth", authRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const startServer = () => {
  const server = http.createServer(app);
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

connectToDB()
  .then(() => startServer())
  .catch((err) => {
    console.error("Error starting the server: ", err);
    process.exit(1);
  });
