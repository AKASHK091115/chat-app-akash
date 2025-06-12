import { io } from "socket.io-client";

let socket;

export const connectSocket = (token) => {
  socket = io("http://localhost:3305", {
    auth: { token },
    transports: ['websocket'],
  });

  socket.on("connect", () => {
    console.log("🔌 Connected to socket server:", socket.id);
  });

  socket.on("authenticated", (data) => {
    console.log("✅ Authenticated on socket:", data);
  });

  socket.on("connect_error", (err) => {
    console.error("❌ Socket connection error:", err.message);
  });

  socket.on("disconnect", (reason) => {
    console.warn("❎ Disconnected from socket server:", reason);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) throw new Error("Socket not initialized");
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
