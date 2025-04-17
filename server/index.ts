import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { prisma } from "./prisma";

const app = express();
const httpServer = createServer(app);

app.use(cors());

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

io.on("connection", (socket) => {
  console.log("✅ 클라이언트 연결됨:", socket.id);

  // ✅ 방 입장
  socket.on("join", async (roomId: string) => {
    socket.join(roomId);
    console.log(`🚪 ${socket.id} 방 입장: ${roomId}`);

    // 해당 방의 메시지 전송
    const pastMessages = await prisma.message.findMany({
      where: { roomId },
      orderBy: { timestamp: "asc" },
    });

    socket.emit("init", pastMessages);
  });

  // ✅ 메시지 수신 및 저장
  socket.on("message", async (msg) => {
    console.log("📩 메시지 수신:", msg);

    const saved = await prisma.message.create({ data: msg });

    // 해당 방에만 브로드캐스트
    io.to(msg.roomId).emit("message", saved);
  });

  socket.on("disconnect", () => {
    console.log("❌ 연결 해제:", socket.id);
  });
});

httpServer.listen(4000, () => {
  console.log("🚀 Socket.IO 서버 실행 중: http://localhost:4000");
});
