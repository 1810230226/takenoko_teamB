// frontend/src/pages/MessageRecipients.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BackButton from "../components/BackButton";

type User = {
  id: number;
  name: string;
  account_number: string;
  balance: number;
  icon_pass: string;
};

function MessageRecipients() {
  const navigate = useNavigate();
  const location = useLocation();
  const excludeUserId: number | undefined = location.state?.excludeUserId;

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:5001/api/users");
        const data: User[] = await res.json();
        const filtered =
          typeof excludeUserId === "number"
            ? data.filter((u) => u.id !== excludeUserId)
            : data;
        setUsers(filtered);
      } finally {
        setLoading(false);
      }
    })();
  }, [excludeUserId]);

  const handleClick = (user: User) => {
    // 選んだ相手を ChatScreen に渡す
    navigate("/messages", { state: { recipient: user } });
  };

  return (
    <div className="mx-auto h-screen bg-orange-50">
      <header className="bg-green-500 text-white p-4 text-lg font-bold grid grid-cols-[auto_1fr_auto] items-center">
        <div className="w-6">
          <BackButton />
        </div>
        <h1 className="text-center">メッセージ</h1>
        <div className="w-6" aria-hidden />
      </header>

      <ul className="divide-y divide-gray-200 flex flex-col">
        {users.map((user) => (
          <li
            key={user.id}
            className="flex items-center p-4 cursor-pointer hover:bg-orange-100"
            onClick={() => handleClick(user)}
          >
            <img
              src={user.icon_pass}
              alt={user.name}
              className="w-20 h-20 rounded-full mr-4"
            />
            <span className="text-gray-800 text-lg">{user.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MessageRecipients;
