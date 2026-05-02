const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);

// 🔌 SOCKET.IO SETUP
const io = new Server(server, {
  cors: {
    origin: "*", // allow all (for development)
  },
});

// 👥 CONNECTION HANDLER
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // 🏠 GET ROOM FROM CLIENT
  const room = socket.handshake.query.room || "default";
  socket.join(room);

  console.log("Joined room:", room);

  // ✏️ DRAW EVENT
  socket.on("draw", (data) => {
    socket.to(room).emit("draw", data);
  });

  // 🧹 CLEAR EVENT
  socket.on("clear", () => {
    socket.to(room).emit("clear");
  });

  // 💬 CHAT EVENT
  socket.on("chat", (msg) => {
    socket.to(room).emit("chat", msg);
  });

  // ❌ DISCONNECT
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// 🚀 START SERVER
const PORT = 5006;

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});