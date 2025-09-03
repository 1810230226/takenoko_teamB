import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import toast from 'react-hot-toast'

function Top() {
    const { user, setUser } = useUser();
    const [showBalance, setShowBalance] = useState(true);


    useEffect(() => {
        fetch(`http://localhost:5001/api/users/${user?.id}`)  // ← id を指定
            .then((res) => res.json())
            .then((data) => {
                setUser(data)
                
            })
            .catch((err) => console.error("Error fetching user:", err));

    }, [user]);

    return (
        <>
            <div className="flex flex-col items-center justify-center w-full min-h-screen p-4 bg-orange-50">
                <div className="flex items-center w-full max-w-md p-4">
                    {/* ユーザー画像 */}
                    <img
                        src="/assets/images/icons/human1.png"
                        alt="ユーザー画像"
                        className="w-1/2 h-auto h-16 rounded-full"
                    />

                    {/* 名前とID */}
                    <div className="ml-4 space-y-4 -mt-6">
                        <p className="text-sm text-gray-500">口座番号 : {user ? user.account_number : "------"}</p>
                        <p className="text-2xl font-bold font-sans">{user ? user.name : "読み込み中..."}</p>
                    </div>
                </div>

                <p className="mb-1 text-left w-full max-w-md ml-2">預金残高</p>
                <p className="flex items-center justify-between w-full max-w-md px-6 py-4 bg-white text-black font-bold rounded-xl text-lg border-2 border-gray mb-5">
                    <span className="flex items-baseline space-x-1">
                        <span>
                            {user
                                ? showBalance
                                    ? user.balance.toLocaleString()
                                    : "******"
                                : "--"
                            }
                        </span>
                        <span>円</span>
                    </span>
                    <img
                        src={
                            showBalance
                                ? "/assets/images/icons/eye-close.png"
                                : "/assets/images/icons/eye-open.png"}
                        alt="アイコン"
                        className="w-6 h-6 cursor-pointer"
                        onClick={() => setShowBalance(!showBalance)}
                    />
                </p>
                {/*
                <p className="flex items-center justify-between w-full max-w-md px-6 py-4 bg-white text-black font-bold rounded-xl text-lg border-2 border-black mb-5">
                    <span>100,000</span>
                    <img
                        src="/assets/images/icons/eye-open.png"
                        alt="アイコン"
                        className="w-6 h-6"
                    />
                </p>
*/}
                <div className="flex justify-center gap-4 mb-5 w-full max-w-md">
                    <Link to="/recipients" state={{ excludeUserId: user?.id }} className="flex flex-col items-center justify-center w-1/2 aspect-square bg-white text-black font-bold rounded-xl border-2 border-gray">
                        <img
                            src="/assets/images/icons/arrow-up.png"
                            alt="送金アイコン"
                            className="w-1/5 h-1/5 object-contain mb-2"
                        />
                        <span className="text-center text-lg">送金</span>
                    </Link>
                    <Link
                        to="/request/recipients"
                        state={{ excludeUserId: user?.id }}
                        className="flex flex-col items-center justify-center w-1/2 aspect-square bg-white text-black font-bold rounded-xl border-2 border-gray"
                    >
                        <img
                            src="/assets/images/icons/arrow-down.png"
                            alt="送金アイコン"
                            className="w-1/5 h-1/5 object-contain mb-2"
                        />
                        <span className="text-center text-lg">請求</span>
                    </Link>
                </div>
                <Link
                    to="/histories" // 👈 遷移先のパスをここに指定
                    className="relative flex items-center w-full max-w-md px-6 py-4 bg-white text-black font-bold rounded-xl text-lg border-2 border-gray mb-5"
                >
                    {/* 中央にテキスト */}
                    <span className="absolute left-1/2 transform -translate-x-1/2">
                        請求履歴
                    </span>

                    {/* 右にアイコン */}
                    <img
                        src="/assets/images/icons/chevron-right.png"
                        alt="アイコン"
                        className="ml-auto w-3 h-3"
                    />
                </Link>
                <Link
                    to="/messages/recipients"
                    className="relative flex items-center w-full max-w-md px-6 py-4 bg-white text-black font-bold rounded-xl text-lg border-2 border-gray mb-5"
                >
                    {/* 中央にテキスト */}
                    <span className="absolute left-1/2 transform -translate-x-1/2">
                        メッセージを見る
                    </span>

                    {/* 右にアイコン */}
                    <img
                        src="/assets/images/icons/chevron-right.png"
                        alt="アイコン"
                        className="ml-auto w-3 h-3"
                    />
                </Link>
            </div>

        </>
    );
}

export default Top;
