import { useState, useEffect } from "react";
import { useUser } from "../context/UserContext";
import { useNavigate, useLocation } from "react-router-dom";

function Link_login() {
    const [accountNumber, setAccountNumber] = useState("");
    const { user, setUser } = useUser();
    const navigate = useNavigate();
    const location = useLocation();

    // URLクエリからidを取得
    const [linkId, setLinkId] = useState<string | null>(null);
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const id = params.get("id");
        setLinkId(id);
    }, [location.search]);

    const handleLogin = async () => {
        try {
            const res = await fetch("http://localhost:5001/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ account_number: accountNumber }),
            });

            if (!res.ok) {
                const error = await res.json();
                alert(error.error || "エラーが発生しました");
                return;
            }

            const data = await res.json();
            setUser({
                id: data.id,
                account_number: data.account_number,
                name: data.name,
                balance: data.balance,
            });

            alert(`ようこそ ${data.name} さん！ 残高: ${data.balance}円`);

            // linkId があれば /remit に遷移
            if (linkId) {
                navigate(`/remit?id=${linkId}`);
            } else {
                navigate("/top");
            }
        } catch (err) {
            console.error(err);
            alert("サーバーエラーが発生しました");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center w-full min-h-screen p-4 bg-orange-50">
            <h1 className="text-3xl font-extrabold text-orange-600 mb-8 drop-shadow-md">
                たけのこ銀行 🏦
            </h1>

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
    );
}

export default Link_login;
