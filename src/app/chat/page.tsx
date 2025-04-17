"use client";

import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { v4 as uuid } from "uuid";

// 서버 주소 (Socket.IO 서버가 이 포트에서 돌아가야 함)
const socket: Socket = io("https://4000-0xmegg-chatmvp-fme2j3kpc2.app.codeanywhere.com/", {
  transports: ["websocket"], // polling 대신 웹소켓 강제
});

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

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Socket connected!", socket.id);
    });
  
    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err);
    });
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("✅ Socket connected!", socket.id);
    });
  
    socket.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err);
    });
  
    socket.on("init", (pastMessages: Message[]) => {
      setMessages(pastMessages);
    });
  
    socket.on("message", (msg: Message) => {
      setMessages((prev) => {
        const exists = prev.some((m) => m.id === msg.id);
        if (exists) return prev; // 중복 방지
        return [...prev, msg];
      });
    });
  
    return () => {
      socket.off("connect");
      socket.off("connect_error");
      socket.off("init");
      socket.off("message");
    };
  }, []);
  

  return (
    <main className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-2">💬 채팅방 - {nickname}</h2>

      <div className="flex-1 overflow-y-auto border rounded p-2 mb-2 bg-white">
  {messages.map((msg) => {
    const isMine = msg.sender === nickname;

    return (
      <div
        key={msg.id}
        className={`flex mb-2 ${isMine ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`max-w-xs p-2 rounded-lg shadow text-sm ${
            isMine
              ? "bg-blue-500 text-white rounded-br-none"
              : "bg-gray-200 text-black rounded-bl-none"
          }`}
        >
          <div className="font-semibold">{msg.sender}</div>
          <div>{msg.content}</div>
          <div className="text-[10px] text-right mt-1 opacity-70">
            {new Date(msg.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    );
  })}
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
