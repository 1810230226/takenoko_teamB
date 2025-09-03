// frontend/src/pages/RequestAmount.tsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

function RequestAmount() {
  const navigate = useNavigate();
  const location = useLocation();
  // Recipients（請求相手を選択）で選んだ相手が入ってくる想定
  const { recipient } = (location.state as any) || {};

  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");

  const formatNumber = (n: number) => n.toLocaleString("ja-JP");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!amount) return;

    // ここではバックエンド呼び出しは行わず、Request 画面に遷移して続き（リンク生成など）を行う
    const yen = Number(String(amount).replace(/,/g, ""));
    navigate("/request", { state: { recipient, amount: yen } });
  };

  return (
    <div className="mx-auto h-screen bg-orange-50 shadow-lg overflow-hidden flex flex-col">
      {/* ヘッダー（Recipients と同じスタイル／タイトルは“請求する”に） */}
      <header className="bg-cyan-600 text-white p-4 text-lg font-bold grid grid-cols-[auto_1fr_auto] items-center">
        <div className="w-6">
          <BackButton />
        </div>
        <h1 className="text-center">請求する</h1>
        <div className="w-6" aria-hidden />
      </header>

      {/* 相手情報 */}
      <div className="p-6 text-center">
        {recipient && (
          <div className="flex items-center">
            <img
              src={recipient.icon_pass}
              alt=""
              className="w-32 h-32 rounded-full"
            />
            <div className="flex flex-col ml-8">
              <p className="text-xl text-gray-800 font-bold">
                {recipient.name} さん
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 金額入力 */}
      <div className="flex-grow px-6">
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label htmlFor="amount" className="block text-sm text-gray-500 mb-1 ml-1">
              請求額
            </label>
            <div className="w-full max-w-sm">
              <div className="flex items-center rounded-md">
                <input
                  type="text"
                  id="amount"
                  placeholder="請求額"
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

        {/* メッセージ */}
        <div>
        <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-500 mb-1 ml-1"
        >
        </label>
        <textarea
            id="message"
            placeholder="メッセージ(任意)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm p-4 text-lg bg-white resize-none"
        ></textarea>
        </div>

          {/* ボタン */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={!amount}
              className={`w-full font-bold p-4 rounded-md shadow-lg transition-colors duration-200 ${
                amount
                  ? "bg-cyan-600 text-white hover:bg-cyan-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              請求する
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RequestAmount;
