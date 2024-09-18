import { Server as HttpServer } from "http";
import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { initializeSocket } from "./socketManager";

dotenv.config();

export const setupWebSocket = (httpServer: HttpServer) => {
  const io = initializeSocket(httpServer);

  io.use(async (socket: Socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      next(new Error("Authentication error: No token provided"));
      return;
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
        userId: string;
      };
      socket.data.user = { id: decoded.userId };
      next();
    } catch (error) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket: Socket) => {
    console.log("New client connected");

    socket.join(socket.data.user.id);

    socket.on("disconnect", () => {
      console.log("Client disconnected");
    });
  });

  return io;
};
