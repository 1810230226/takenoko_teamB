import { useState } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate } from "react-router-dom";


function Login() {
    const [accountNumber, setAccountNumber] = useState("");
    //const [userInfo, setUserInfo] = useState(null);
    const { user, setUser } = useUser();
    const navigate = useNavigate();  // 画面遷移用

    const handleLogin = async () => {
        try {
            const res = await fetch("http://localhost:5000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ account_number: accountNumber }),
            });

            console.log("ok des")
            if (!res.ok) {
                const error = await res.json();
                alert(error.error || "エラーが発生しました");
                return;
            }

            const data = await res.json();
            //setUserInfo(data); // ユーザー情報を保存
            setUser({
                account_number: data.account_number,
                name: data.name,
                balance: data.balance,
            });
            console.log(user)
            alert(`ようこそ ${data.name} さん！ 残高: ${data.balance}円`);
            // ここで画面遷移
            navigate("/top");
        } catch (err) {
            console.error(err);
            alert("サーバーエラーが発生しました");
        }
    };


    return (
        <>
            <div className="flex flex-col items-center justify-center w-full min-h-screen p-4 bg-orange-50">
                {/* タイトル */}
                <h1 className="text-3xl font-extrabold text-orange-600 mb-8 drop-shadow-md">
                    たけのこ銀行 🏦
                </h1>

                {/* ログインカード */}
                <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md h-auto flex flex-col items-center">
                    <img
                        src="assets/images/icons/takenoko.png"
                        alt="takenoko"
                        className="w-20 h-20 mb-6"
                    />

                    <input
                        type="text"
                        placeholder="口座番号を入力"
                        className="w-full px-4 py-3 mb-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-300"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                    />

                    <button
                        className="w-full py-3 bg-orange-400 hover:bg-orange-500 text-white font-semibold rounded-full shadow-md transition-transform transform hover:scale-105"
                        onClick={handleLogin}
                    >
                        ログイン
                    </button>
                </div>
            </div>

        </>
    );
}

export default Login;
