"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const [nickname, setNickname] = useState("");
  const router = useRouter();

  const handleEnter = () => {
    if (!nickname.trim()) {
      alert("닉네임을 입력해주세요.");
      return;
    }

    localStorage.setItem("nickname", nickname);
    router.push("/chat");
  };

  return (
    <main className="flex flex-col items-center justify-center h-screen px-4">
      <h1 className="text-2xl font-bold mb-4">실시간 채팅</h1>
      <input
        type="text"
        placeholder="닉네임을 입력하세요"
        value={nickname}
        onChange={(e) => setNickname(e.target.value)}
        className="border p-2 rounded w-full max-w-sm mb-4"
      />
      <button
        onClick={handleEnter}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
      >
        입장하기
      </button>
    </main>
  );
}
