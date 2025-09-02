import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type User = {
    id: number;
    name: string;
    account_number: string;
    balance: number;
};

function Recipients() {
    const [users, setUsers] = useState<User[]>([]);
    const navigate = useNavigate();

    useEffect(() => {
    fetch("http://localhost:5001/api/users")
        .then((res) => res.json())
        .then((data: User[]) => setUsers(data))
        .catch((err) => console.error("Error fetching users:", err));
    }, []);

    const handleClick = (user: User) => {
        console.log("選択:", user.name);
        navigate("/amount", { state: { user } });
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
