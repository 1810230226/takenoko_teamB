import React from "react";
import { useNavigate } from "react-router-dom";

function Recipients() {
    const navigate = useNavigate();

    // 今回は const で定義（将来的には DB から取得）
    const recipients = [
        { id: 1, name: "サンプル Aさん", image: "/assets/images/icons/human1.png" },
        { id: 2, name: "サンプル Bさん", image: "/assets/images/icons/human1.png" },
        { id: 3, name: "サンプル Dさん", image: "/assets/images/icons/human1.png" },
    ];

    const handleClick = (recipientName: string) => {
        // 将来的には選んだ recipient の情報を渡す
        console.log("選択:", recipientName);
        navigate("/amount");
    };

    return (
        <div className="mx-auto h-screen bg-orange-50">
        <header className="bg-rose-400 text-white p-4 text-center text-lg font-bold">
            送金相手を選択
        </header>

        <ul className="divide-y divide-gray-200 flex flex-col">
            {recipients.map((recipient) => (
            <li
                key={recipient.id}
                className="flex items-center p-4 cursor-pointer hover:bg-orange-100"
                onClick={() => handleClick(recipient.name)}
            >
                <img
                src={recipient.image}
                alt={recipient.name}
                className="w-20 h-20 rounded-full mr-4"
                />
                <span className="text-gray-800 text-lg">{recipient.name}</span>
            </li>
            ))}
        </ul>
        </div>
    );
}

export default Recipients;
