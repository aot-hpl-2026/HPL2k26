import { Server } from "socket.io";
import { env } from "../config/env.js";

export const initSockets = async (httpServer, _redis) => {
  const io = new Server(httpServer, {
    cors: { origin: env.corsOrigin },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  console.log("Socket.IO initialized (no live scoring)");

  return io;
};
