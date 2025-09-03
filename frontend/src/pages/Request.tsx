import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Request() {
    const [amount, setAmount] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const formatNumber = (num: string) => {
        const value = num.replace(/,/g, "");
        if (!/^\d*$/.test(value)) return num;
        return Number(value).toLocaleString("ja-JP");
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!amount) {
            alert("請求金額を入力してください。");
            return;
        }

        const numericAmount = Number(amount.replace(/,/g, ""));
        setLoading(true);

        try {
            const response = await fetch("http://localhost:5001/api/request-links", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sender_id: 1,
                    amount: numericAmount,
                    message: message || "",
                }),
            });

            if (!response.ok) throw new Error("リンク作成に失敗しました");

            const data = await response.json();

            // ここで遷移
            // data.id など、バックエンドが返すリンクIDに置き換えてください
            navigate(`/create-link?id=${data.id}`);
        } catch (err) {
            alert("リンク作成中にエラーが発生しました");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto h-screen bg-white shadow-lg flex flex-col">
            <header className="bg-cyan-600 text-white text-center p-4 font-bold text-lg">
                請求リンクの作成
            </header>

            <div className="p-6 flex-grow flex flex-col justify-between">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="request-amount" className="block text-gray-500 font-medium mb-2">
                            請求金額
                        </label>
                        <input
                            type="text"
                            id="request-amount"
                            placeholder="例: 15,000"
                            value={amount}
                            onChange={(e) => setAmount(formatNumber(e.target.value))}
                            className="block w-full rounded-md border-gray-300 shadow-sm p-4 text-lg text-gray-900 font-bold bg-gray-100"
                        />
                    </div>

                    <div>
                        <label htmlFor="message" className="block text-gray-500 font-medium mb-2">
                            メッセージ (任意)
                        </label>
                        <textarea
                            id="message"
                            rows={4}
                            placeholder="例: 先日の食事代です"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            className="block w-full rounded-md border-gray-300 shadow-sm p-4 text-lg bg-gray-100 resize-none"
                        ></textarea>
                    </div>

                    <div className="mt-auto">
                        <button
                            type="submit"
                            disabled={!amount || loading}
                            className={`w-full font-bold p-4 rounded-md shadow-lg transition-colors duration-200 ${
                                amount
                                    ? "bg-rose-500 text-white hover:bg-rose-600"
                                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                            }`}
                        >
                            {loading ? "作成中..." : "リンクを作成"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Request;
