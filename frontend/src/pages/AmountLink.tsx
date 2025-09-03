// frontend/src/pages/AmountLink.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

function AmountLink() {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const formatNumber = (n: number) => n.toLocaleString("ja-JP");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!amount) return;
    const yen = Number(String(amount).replace(/,/g, ""));
    // request の画面に「送金リンク作成用のデータ」として渡す
    navigate("/request", { state: { mode: "send-link", amount: yen, message } });
  };

  return (
    <div className="mx-auto h-screen bg-orange-50 shadow-lg overflow-hidden flex flex-col">
      {/* Recipients系と同じトーン（rose色） */}
      <header className="bg-rose-400 text-white p-4 text-lg font-bold grid grid-cols-[auto_1fr_auto] items-center">
        <div className="w-6">
          <BackButton />
        </div>
        <h1 className="text-center">送金リンクを作成</h1>
        <div className="w-6" aria-hidden />
      </header>

      <div className="flex-grow px-6 py-6">
        <form className="space-y-4" onSubmit={onSubmit}>
          {/* 金額 */}
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-500 mb-1 ml-1">
              送金額
            </label>
            <div className="w-full max-w-sm">
              <div className="flex items-center rounded-md">
                <input
                  type="text"
                  id="amount"
                  placeholder="送金額"
                  value={amount}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/,/g, "");
                    if (/^\d*$/.test(raw)) {
                      setAmount(raw ? formatNumber(Number(raw)) : "");
                    }
                  }}
                  className="block w-full rounded-md border border-gray-300 shadow-sm p-4 text-lg bg-white"
                />
                <span className="px-3 text-lg text-gray-700">円</span>
              </div>
            </div>
          </div>

          {/* メッセージ（任意） */}
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-500 mb-1 ml-1">
              メッセージ(任意)
            </label>
            <textarea
              id="message"
              placeholder="メッセージ(任意)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="block w-full rounded-md border border-gray-300 shadow-sm p-4 text-lg bg-white resize-none"
            />
          </div>

          {/* 作成ボタン */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={!amount}
              className={`w-full font-bold p-4 rounded-md shadow-lg transition-colors duration-200 ${
                amount
                  ? "bg-rose-500 text-white hover:bg-rose-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              送金リンクを作成する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AmountLink;