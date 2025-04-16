"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { v4 as uuid } from "uuid";

// 서버 주소 (Socket.IO 서버가 이 포트에서 돌아가야 함)
const socket: Socket = io("http://localhost:4000");

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
}

export default function ChatPage() {
  const [nickname, setNickname] = useState<string>("");
  const [message, setMessage] = useState<string>("");
  const [messages, setMessages] = useState<Message[]>([]);
  const messageEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const storedNickname = localStorage.getItem("nickname");
    if (!storedNickname) {
      alert("닉네임이 없습니다. 다시 접속해주세요.");
      window.location.href = "/";
    } else {
      setNickname(storedNickname);
    }
  }, []);

  useEffect(() => {
    socket.on("message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("message");
    };
  }, []);

  useEffect(() => {
    // 메시지 리스트 업데이트 시 스크롤 맨 아래로
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = () => {
    if (!message.trim()) return;

    const msg: Message = {
      id: uuid(),
      sender: nickname,
      content: message,
      timestamp: new Date().toISOString(),
    };

    socket.emit("message", msg);
    setMessage("");
  };

  return (
    <main className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-2">💬 채팅방 - {nickname}</h2>

      <div className="flex-1 overflow-y-auto border rounded p-2 mb-2 bg-white">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-1">
            <span className="font-semibold">{msg.sender}</span>:{" "}
            <span>{msg.content}</span>
            <span className="text-gray-400 text-sm ml-2">
              {new Date(msg.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ))}
        <div ref={messageEndRef} />
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          className="flex-1 border rounded p-2"
          placeholder="메시지 입력..."
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          전송
        </button>
      </div>
    </main>
  );
}
