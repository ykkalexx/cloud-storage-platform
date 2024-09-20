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

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

scheduledCleanupTask();

const startServer = () => {
  const server = http.createServer(app);
  const io = setupWebSocket(server);
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
