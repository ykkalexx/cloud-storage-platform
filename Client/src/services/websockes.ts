import { io, Socket } from "socket.io-client";

let socket: Socket;

export const initializeSocket = (token: string) => {
  socket = io("http://localhost:3000", {
    auth: { token },
  });

  socket.on("conenct", () => {
    console.log("Connected to server");
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from server");
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    throw new Error("Socket not initialized");
  }
  return socket;
};
