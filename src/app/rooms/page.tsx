"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

interface Room {
  id: string;
  name: string;
}

export default function RoomListPage() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomName, setRoomName] = useState("");
  const [nickname, setNickname] = useState<string>("");

  useEffect(() => {
    const stored = localStorage.getItem("nickname");
    if (!stored) {
      alert("닉네임이 없습니다. 다시 접속해주세요.");
      router.push("/");
    } else {
      setNickname(stored);
    }
  }, [router]);

  useEffect(() => {
    // ✅ 임시: 로컬 저장소에서 방 목록 관리 (백엔드 연동 전)
    const savedRooms = localStorage.getItem("rooms");
    if (savedRooms) setRooms(JSON.parse(savedRooms));
  }, []);

  const createRoom = () => {
    if (!roomName.trim()) return;
    const newRoom: Room = { id: uuid(), name: roomName };
    const updatedRooms = [...rooms, newRoom];
    setRooms(updatedRooms);
    localStorage.setItem("rooms", JSON.stringify(updatedRooms));
    setRoomName("");
  };

  const enterRoom = (roomId: string) => {
    router.push(`/chat/${roomId}`);
  };

  return (
    <main className="max-w-2xl mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">👋 {nickname}님, 대화방 선택</h2>

      <div className="mb-4">
        <input
          type="text"
          value={roomName}
          onChange={(e) => setRoomName(e.target.value)}
          className="border rounded p-2 mr-2"
          placeholder="대화방 이름"
        />
        <button
          onClick={createRoom}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          생성
        </button>
      </div>

      <ul className="space-y-2">
        {rooms.map((room) => (
          <li
            key={room.id}
            className="border rounded p-2 cursor-pointer hover:bg-gray-100"
            onClick={() => enterRoom(room.id)}
          >
            🗨️ {room.name}
          </li>
        ))}
      </ul>
    </main>
  );
}
