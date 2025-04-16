import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
const httpServer = createServer(app);

app.use(cors());

const io = new Server(httpServer, {
  cors: {
    origin: "*", // 프론트엔드 포트 (예: http://localhost:3000)
    methods: ["GET", "POST"]
  }
});

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

io.on("connection", (socket) => {
  console.log("✅ 클라이언트 연결됨:", socket.id);

  socket.on("message", (msg: Message) => {
    console.log("📩 메시지 수신:", msg);
    io.emit("message", msg); // 전체 브로드캐스트
  });

  socket.on("disconnect", () => {
    console.log("❌ 연결 해제:", socket.id);
  });
});

httpServer.listen(4000, () => {
  console.log("🚀 Socket.IO 서버 실행 중: http://localhost:4000");
});
