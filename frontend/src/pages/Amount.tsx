import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type User = {
    id: number;
    name: string;
    account_number: string;
    balance: number;
};

function Amount() {
    const navigate = useNavigate();
    const location = useLocation();
    const user: User | undefined = (location.state as { user?: User } | null)?.user;

    const [amount, setAmount] = useState(""); // 入力値を管理

    const [balance, setBalance] = useState<number | null>(null);

    useEffect(() => {
    fetch("http://localhost:5001/api/users/1")
        .then(r => r.json())
        .then((u) => setBalance(u.balance))
        .catch(console.error);
    }, []);

    // 数値を3桁ごとにカンマ区切りにする関数
    const formatNumber = (num: number) => {
        return num.toLocaleString("ja-JP");
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!amount) return; // 空なら何もしない
        navigate("/complete"); // complete画面に遷移
    };

    return (
        <div className="mx-auto h-screen bg-orange-50 shadow-lg rounded-3xl overflow-hidden flex flex-col">
        <div className="p-6 text-center">
            <div className="flex items-center">
            <img
                src="/assets/images/icons/human1.png"
                alt="田中一郎"
                className="w-32 h-32 rounded-full mb-4"
            />
            <div className="flex flex-col ml-10">
                <p className="text-xl text-gray-800">{user?.name}さんに</p>
                <p className="text-xl text-gray-800 font-bold">送金する</p>
            </div>
            </div>
        </div>

        <div className="flex-grow p-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
            {/* 上限額 */}
            <div>
                <label
                htmlFor="transfer-limit"
                className="block text-sm font-medium text-gray-500 mb-1"
                >
                送金上限額
                </label>
                <div className="relative">
                <input
                    type="text"
                    id="transfer-limit"
                    value={balance !== null ? `${balance.toLocaleString("ja-JP")} 円` : "----"}
                    className="block w-full rounded-md border-gray-300 shadow-sm p-4 text-gray-900 text-lg font-bold bg-white"
                    readOnly
                />
                </div>
            </div>

            {/* 送る金額 */}
            <div>
                {amount && (
                <label
                    htmlFor="amount"
                    className="block text-sm font-medium text-gray-500 mb-1"
                >
                    送る金額
                </label>
                )}

                <input
                type="text"
                id="amount"
                placeholder="送る金額"
                value={amount}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const value = e.target.value.replace(/,/g, ""); // カンマ除去
                    if (/^\d*$/.test(value)) {
                    // 半角数字のみ
                    // 入力値をカンマ付きに変換
                    setAmount(value ? formatNumber(Number(value)) : "");
                    }
                }}
                className="block w-full rounded-md border-gray-300 shadow-sm p-4 text-lg bg-white"
                />
            </div>

            {/* メッセージ */}
            <div>
                <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-500 sr-only"
                >
                メッセージ(任意)
                </label>
                <textarea
                id="message"
                placeholder="メッセージ(任意)"
                className="block w-full rounded-md border-gray-300 shadow-sm p-4 text-lg bg-white resize-none"
                ></textarea>
            </div>

            {/* 送金ボタン */}
            <div className="mt-8">
                <button
                type="submit"
                disabled={!amount}
                className={`w-full font-bold p-4 rounded-md shadow-lg transition-colors duration-200 ${
                    amount
                    ? "bg-rose-500 text-white hover:bg-rose-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
                >
                送金する
                </button>
            </div>
            </form>
        </div>
        </div>
    );
}

export default Amount;
