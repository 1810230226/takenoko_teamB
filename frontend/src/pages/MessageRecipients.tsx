// frontend/src/pages/MessageRecipients.tsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import BackButton from "../components/BackButton";
import { useUser } from "../context/UserContext";

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
  const { user } = useUser();
  const [pendingByUser, setPendingByUser] = useState<Record<number, number>>({});
  const [unreadByUser, setUnreadByUser] = useState<Record<number, number>>({});

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

  useEffect(() => {
    const calc = () => {
      try {
        const all = JSON.parse(localStorage.getItem("app_messages") || "[]");
        const uid = user?.id;
        if (!uid) {
          setPendingByUser({});
          setUnreadByUser({});
          return;
        }
        const pendingMap: Record<number, number> = {};
        const unreadMap: Record<number, number> = {};
        for (const r of all) {
          if (!r || typeof r.fromId !== "number") continue;
          // 未払い請求（相手→自分）
          if (r.toId === uid && r.type === "request" && r.status === "支払い待ち") {
            pendingMap[r.fromId] = (pendingMap[r.fromId] || 0) + 1;
          }
          // 未読メッセージ（相手→自分）
          if (r.toId === uid && r.isRead === false) {
            unreadMap[r.fromId] = (unreadMap[r.fromId] || 0) + 1;
          }
        }
        setPendingByUser(pendingMap);
        setUnreadByUser(unreadMap);
      } catch {
        setPendingByUser({});
        setUnreadByUser({});
      }
    };
    calc();
    window.addEventListener("focus", calc);
    window.addEventListener("storage", calc);
    return () => {
      window.removeEventListener("focus", calc);
      window.removeEventListener("storage", calc);
    };
  }, [user]);

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
              src={user.icon_pass || "/assets/images/icons/human1.png"}
              alt={user.name}
              className="w-20 h-20 rounded-full mr-4 object-cover"
            />
            <div className="flex-1 flex items-center justify-between">
              <span className="text-gray-800 text-lg">{user.name}</span>
              <div className="ml-3 w-24 flex flex-col items-center">
                {unreadByUser[user.id] > 0 && (
                  <span className="bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
                    {unreadByUser[user.id] > 9 ? "9+" : unreadByUser[user.id]}
                  </span>
                )}
                {pendingByUser[user.id] > 0 && (
                  <span className="mt-1 bg-rose-500 text-white text-xs font-bold rounded-full px-2 py-0.5 shadow whitespace-nowrap">
                    未払い{pendingByUser[user.id]}件
                  </span>
                )}
                {!(pendingByUser[user.id] > 0) && (
                  <span className="mt-1 invisible px-2 py-0.5">占位</span>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MessageRecipients;
