"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { v4 as uuid } from "uuid";

const socket: Socket = io("https://4000-0xmegg-chatmvp-fme2j3kpc2.app.codeanywhere.com", {
  transports: ["websocket"],
});

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  roomId: string;
}

export default function ChatRoomPage() {
  const { roomId } = useParams();
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

  // 방 입장
  useEffect(() => {
    if (roomId) {
      socket.emit("join", roomId);
    }
  }, [roomId]);

  // 소켓 이벤트 등록
  useEffect(() => {
    socket.on("init", (pastMessages: Message[]) => {
      setMessages(pastMessages);
    });

    socket.on("message", (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => {
      socket.off("init");
      socket.off("message");
    };
  }, []);

  // 메시지 전송
  const sendMessage = () => {
    if (!message.trim()) return;

    const msg: Message = {
      id: uuid(),
      sender: nickname,
      content: message,
      timestamp: new Date().toISOString(),
      roomId: String(roomId),
    };

    socket.emit("message", msg);
    setMessage("");
  };

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <main className="flex flex-col h-screen max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-2">💬 채팅방 ({roomId}) - {nickname}</h2>

      <div className="flex-1 overflow-y-auto border rounded p-2 mb-2 bg-white">
        {messages.map((msg) => {
          const isMine = msg.sender === nickname;
          return (
            <div
              key={msg.id}
              className={`mb-1 flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-xs px-3 py-2 rounded-lg ${
                  isMine ? "bg-blue-500 text-white" : "bg-gray-200"
                }`}
              >
                <div className="text-sm font-semibold">{msg.sender}</div>
                <div>{msg.content}</div>
                <div className="text-xs text-right opacity-70">
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
