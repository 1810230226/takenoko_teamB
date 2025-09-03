import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";


function LinkSend() {
    const { user, setUser } = useUser();//ログインしたユーザー
    console.log(`id:${user?.id},name:${user?.name},acount_number:${user?.account_number},balance:${user?.balance}`)

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
                        <p className="text-xl text-gray-800">〇〇さんに</p>
                        <p className="text-xl text-gray-800 font-bold">送金する</p>
                    </div>
                </div>
            </div>

            <div className="flex-grow p-6">
                <form className="space-y-6" onSubmit={() => console.log("ok")}>
                    {/* 上限額 */}
                    <div>
                        <label
                            htmlFor="transfer-limit"
                            className="block text-sm font-medium text-gray-500 mb-1"
                        >
                            送金上限額
                        </label>
                        <div className="relative">
                            <p>〇〇円</p>
                        </div>
                    </div>

                    <div>


                        <label
                            htmlFor="amount"
                            className="block text-sm font-medium text-gray-500 mb-1"
                        >
                            送る金額
                        </label>


                        <div className="w-full max-w-sm">
                            <p>〇〇円</p>
                        </div>

                    </div>

                    {/* メッセージ */}
                    <div>
                        <label
                            htmlFor="message"
                            className="block text-sm font-medium text-gray-500"
                        >
                            〇〇さんから
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
                            //disabled={!amount}
                            className={`w-full font-bold p-4 rounded-md shadow-lg transition-colors duration-200 bg-rose-500 text-white hover:bg-rose-600}`}
                        >
                            送金する
                        </button>
                    </div>
                </form>
            </div>
        </div>

    );
}

export default LinkSend;