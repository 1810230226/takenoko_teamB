import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import { useUser } from "../context/UserContext";

function Request() {
    const { user } = useUser();
    const [amount, setAmount] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [linkInfo, setLinkInfo] = useState<any>(null); // 作成リンク情報を保持
    const navigate = useNavigate();

    const formatNumber = (num: string) => {
        const value = num.replace(/,/g, "");
        if (!/^\d*$/.test(value)) return num;
        return Number(value).toLocaleString("ja-JP");
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!user || !user.id) {
            alert("ログインしてください");
            return;
        }

        if (!amount) {
            alert("請求金額を入力してください。");
            return;
        }

        const numericAmount = Number(amount.replace(/,/g, ""));
        setLoading(true);

        try {
            // 請求リンク作成
            const response = await fetch("http://localhost:5001/api/request-links", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    sender_id: user.id,
                    amount: numericAmount,
                    message: message || "",
                }),
            });

            if (!response.ok) throw new Error("リンク作成に失敗しました");

            const data = await response.json();
            const linkId = data.id;

            // 作成したリンク情報を取得
            const resInfo = await fetch(`http://localhost:5001/api/request-links/${linkId}`);
            if (!resInfo.ok) throw new Error("リンク情報の取得に失敗しました");
            const info = await resInfo.json();
            setLinkInfo(info);

            // 必要に応じてページ遷移
            navigate(`/create-link?id=${linkId}`);
        } catch (err) {
            console.error(err);
            alert("リンク作成中にエラーが発生しました");
        } finally {
            setLoading(false);
        }
    };

    // 作成フォーム
    return (
        <div className="mx-auto h-screen bg-white shadow-lg flex flex-col">

            <header className="bg-cyan-600 text-white p-4 font-bold text-lg grid grid-cols-[auto_1fr_auto] items-center">
                <div className="w-6"><BackButton /></div>
                <h1 className="text-center">請求リンクの作成</h1>
                <div className="w-6" aria-hidden />
            </header>

            <div className="p-6 flex-grow flex flex-col justify-between">
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="request-amount" className="block text-gray-500 font-medium mb-2">
                            請求金額
                        </label>
                        <div className="flex justify-start items-center">
                            <input
                                type="text"
                                id="request-amount"
                                placeholder="金額を入力"
                                value={amount}
                                onChange={(e) => setAmount(formatNumber(e.target.value))}
                                className="block w-full max-w-sm rounded-md border-gray-300 shadow-sm p-4 text-lg text-gray-900 font-bold bg-gray-100"
                            />
                            <span className="text-base ml-2">円</span>
                        </div>
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
