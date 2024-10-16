import express from "express";
import dotenv from "dotenv";
import { authRouter } from "./routes/authRoutes";
import http from "http";
import cors from "cors";
import { Request, Response, NextFunction } from "express";
import { connectToDB } from "config/database";
import cookieParser from "cookie-parser";
import { filesRouter } from "routes/filesRoutes";
import { scheduledCleanupTask } from "scheduledTasks/cleanupTask";
import { setupWebSocket } from "websockets/server";
import { shareRouter } from "routes/shareRoutes";
import { publicRoutes } from "routes/publicRoutes";
import { searchRoutes } from "routes/searchRoutes";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const corsOptions = {
  origin: "http://localhost:5173",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(express.json());
app.use(cors(corsOptions));
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/file", filesRouter);
app.use("/share", shareRouter);
app.use("/public", publicRoutes);
app.use(searchRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("Error occurred:", err);
  res
    .status(500)
    .json({ message: "Internal server error, please try again later." });
});

scheduledCleanupTask();

const startServer = () => {
  const server = http.createServer(app);
  const io = setupWebSocket(server);
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};

const MAX_RETRIES = 5;
let retryCount = 0;

const connectWithRetry = () => {
  connectToDB()
    .then(() => startServer())
    .catch((err) => {
      retryCount += 1;
      console.error(`Error starting the server (attempt ${retryCount}): `, err);
      if (retryCount < MAX_RETRIES) {
        setTimeout(connectWithRetry, 5000);
      } else {
        process.exit(1);
      }
    });
};

connectWithRetry();
