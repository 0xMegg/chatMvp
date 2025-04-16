import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { prisma } from "./prisma"; // ✅ 추가

console.log('test');

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

io.on("connection", async (socket) => {
  console.log("✅ 클라이언트 연결됨:", socket.id);

  // ✅ 기존 메시지 DB에서 불러와서 클라이언트에 전송
  const pastMessages = await prisma.message.findMany({
    orderBy: { timestamp: "asc" },
  });
  socket.emit("init", pastMessages);

  socket.on("message", async (msg) => {
    console.log("📩 메시지 수신:", msg);

    // ✅ DB에 저장
    const saved = await prisma.message.create({ data: msg });

    // ✅ 전체에 브로드캐스트
    io.emit("message", saved);
  });

  socket.on("disconnect", () => {
    console.log("❌ 연결 해제:", socket.id);
  });
});
