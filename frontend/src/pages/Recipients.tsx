import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type User = {
    id: number;
    name: string;
    account_number: string;
    balance: number;
};

function Recipients() {
    const navigate = useNavigate();
    const location = useLocation();
    const excludeUserId: number | undefined = location.state?.excludeUserId;

    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch("http://localhost:5000/api/users");
                const data: User[] = await res.json();
                const filtered = typeof excludeUserId === "number"
                ? data.filter(u => u.id !== excludeUserId)
                : data;
            setUsers(filtered);
        } finally {
            setLoading(false);
        }
        })();
    }, [excludeUserId]);

    const handleClick = (user: User) => {
        console.log("選択:", user.name);
        navigate("/amount", { state: { recipient: user } });
    };

    return (
        <div className="mx-auto h-screen bg-orange-50">
        <header className="bg-rose-400 text-white p-4 text-center text-lg font-bold">
            送金相手を選択
        </header>

        <ul className="divide-y divide-gray-200 flex flex-col">
            {users.map((user) => (
            <li
                key={user.id}
                className="flex items-center p-4 cursor-pointer hover:bg-orange-100"
                onClick={() => handleClick(user)}
            >
                <img
                    src="/assets/images/icons/human1.png"
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

export default Recipients;
