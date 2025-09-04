import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { CircleAlert } from "lucide-react";
import BackButton from "../components/BackButton";

function Recieve() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, setUser } = useUser();

    const [recipient, setRecipient] = useState<any>(null);
    const [amount, setAmount] = useState<string>(""); // 入力値
    const [error, setError] = useState(false);

    const TRANSFER_LIMIT = user?.balance;


    // URL パラメータ id を取得
    const [linkId, setLinkId] = useState<string | null>(null);
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const id = params.get("id");
        if (id) setLinkId(id);

        // デバッグ: request_linkのデータを出力
        if (id) {
            fetch(`http://localhost:5001/api/request-links/${id}`)
                .then(res => res.json())
                .then(data => {
                    console.log("request_linkデータ:", data);
                })
                .catch(err => {
                    console.error("request_linkデータ取得エラー:", err);
                });
        }
    }, [location.search]);

    // linkId から送金先と金額を取得
useEffect(() => {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  if (!id) return;

  const fetchLinkData = async () => {
    try {
      // request-links/:id から amount と sender を取得
      const resLink = await fetch(`http://localhost:5001/api/request-links/${id}`);
      if (!resLink.ok) throw new Error("リンク情報の取得に失敗");
      const linkData = await resLink.json();

      console.log("linkData full:", linkData);

      // sender オブジェクトを recipient にセット
      setRecipient(linkData.sender);
      setAmount(linkData.amount.toLocaleString());
      setLinkId(id);

    } catch (err) {
      console.error(err);
      alert("リンク情報の取得に失敗しました");
    }
  };

  fetchLinkData();
}, [location.search]);


    const formatNumber = (num: number) => num.toLocaleString("ja-JP");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!amount || !recipient) return;

        const numericAmount = Number(amount.replace(/,/g, ""));
        if (numericAmount > Number(TRANSFER_LIMIT)) {
            setError(true);
            return;
        }

        try {
                const res = await fetch("http://localhost:5001/api/claim-link", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    link_id: linkId,
                    receiver_num: user?.account_number,
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                alert(error.error || "送金エラー");
                return;
            }

            const data = await res.json();
            setUser({ ...user!, balance: user!.balance - numericAmount });
            navigate("/finish", { state: { recipientName: recipient.name, amount: numericAmount } });
        } catch (err) {
            console.error(err);
            alert("サーバーエラー");
        }
    };

    if (!recipient) return <p className="p-6 text-center">受取人情報を読み込み中…</p>;

    return (
        <div className="mx-auto h-screen bg-orange-50 flex flex-col">
            <header className="bg-cyan-600 text-white p-4 text-lg font-bold grid grid-cols-[auto_1fr_auto] items-center">
                <div className="w-6"><BackButton /></div>
                <h1 className="text-center">受け取る</h1>
                <div className="w-6" aria-hidden />
            </header>

            <div className="p-6 text-center">
                <div className="flex items-center">
                    <img src="/assets/images/icons/human1.png" alt="" className="w-32 h-32 rounded-full" />
                    <div className="flex flex-col ml-8">
                        <p className="text-xl font-bold">{recipient.name} さん</p>
                    </div>
                </div>
            </div>

            <div className="flex-grow px-6">
                <form className="space-y-2" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-500 mb-1 ml-1">受取金額</label>
                        <div className="w-full max-w-sm">
                            <div className="flex items-center rounded-md p-4 border border-gray-300 bg-gray-100">
                                <span className="text-lg text-gray-900">{amount ? `${amount} 円` : "0 円"}</span>
                            </div>
                            <p className="text-red-600 text-sm h-5 ml-2 flex items-center">
                                {error && <><CircleAlert className="w-4 h-4 mr-1" />送金上限額を超えています</>}
                            </p>
                        </div>
                    </div>

                    {/* <div>
                        <label className="sr-only">メッセージ(任意)</label>
                        <textarea placeholder="メッセージ(任意)" className="block w-full rounded-md border-gray-300 shadow-sm p-4 text-lg bg-white resize-none"></textarea>
                    </div> */}

                    <div className="mt-8">
                        <button
                            type="submit"
                            disabled={!amount}
                            className={`w-full font-bold p-4 rounded-md shadow-lg transition-colors duration-200 ${amount ? "bg-rose-500 text-white hover:bg-rose-600" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                        >
                            受け取る
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default Recieve;
