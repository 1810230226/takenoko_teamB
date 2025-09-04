import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from "../context/UserContext";

// ----------------------------------------------------
// 新しいデータ構造の型定義
// ----------------------------------------------------
interface Transaction {
    type: "sent" | "request" | "received";
    date: string;
    amount: number;
    recipient: string;
    status: "送金済み" | "請求済み" | "請求中" | "受取済み";
    message: string | null;
    icon: string;
}

interface PeriodSection {
    period: string;
    transactions: Transaction[];
}

// ----------------------------------------------------
// 取引カードのコンポーネント（修正版）
// ----------------------------------------------------
const TransactionCard = ({ transaction }: { transaction: Transaction }) => {
    const { type, date, amount, recipient, status, message, icon } = transaction;

    const typeClasses = type === "sent" ? "bg-rose-500" : type === "request" ? "bg-cyan-500" : "bg-green-500";
    const statusClasses = (() => {
        switch (status) {
            case "送金済み":
            case "請求済み":
            case "受取済み":
                return "bg-green-500 text-white";
            case "請求中":
                return "bg-gray-400 text-gray-700";
            default:
                return "";
        }
    })();

    // num に明示的に number 型を指定
    const formatAmount = (num: number) => num.toLocaleString("ja-JP");

    return (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <div className="flex justify-between items-center mb-2">
                <span className={`text-white text-xs font-bold px-3 py-1 rounded-full ${typeClasses}`}>
                    {type === "sent" ? "送金" : type === "request" ? "請求" : "受取"}
                </span>
                <span className="text-sm text-gray-500">{date}</span>
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-2">{formatAmount(amount)}円</div>
            <div className="flex items-center mb-2">
                <img src={icon} alt={recipient} className="w-8 h-8 rounded-full mr-2" />
                <span className="text-base text-gray-700 font-bold flex-1">{recipient} さん{type === "sent" || type === "request" ? "へ" : "から"}</span>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusClasses}`}>
                    {status}
                </span>
            </div>
            {message && (
                <div className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200">
                    {message}
                </div>
            )}
        </div>
    );
};

// ----------------------------------------------------
// メインの送金履歴コンポーネント（修正版）
// ----------------------------------------------------
function TransactionHistory() {
    const navigate = useNavigate();
    const { user, setUser } = useUser();
    const [showBalance, setShowBalance] = useState(true);
    const [transactionData, setTransactionData] = useState<PeriodSection[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const USER_NUM = user?.account_number;

    useEffect(() => {
        const fetchTransactionData = async () => {
            try {
                const response = await fetch(`http://localhost:5001/api/get_history/${USER_NUM}`);

                if (!response.ok) {
                    throw new Error('データの取得に失敗しました');
                }
                const rawData: [string, string, number, string, number][] = await response.json();

                // APIデータを既存のコンポーネントの形式に変換
                const groupedData = rawData.reduce((acc: {[key: string]: PeriodSection}, rawMsg) => {
                    const [partnerName, datetimeString, amount, messageText, flag] = rawMsg;

                    const dateObj = new Date(datetimeString);
                    const period = dateObj.toLocaleDateString("ja-JP", {
                        year: 'numeric',
                        month: 'long'
                    });
                    const date = dateObj.toLocaleDateString("ja-JP", {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }) + ' ' + dateObj.toLocaleTimeString("ja-JP", {
                        hour: '2-digit',
                        minute: '2-digit'
                    });

                    // APIのフラグ（flag）に基づいてタイプとステータスを決定
                    // 1: 送金済み, 0: 受取済み
                    const type: "sent" | "received" = flag === 1 ? "sent" : "received";
                    const status: "送金済み" | "受取済み" = flag === 1 ? "送金済み" : "受取済み";
                    
                    // 仮のアイコンを設定
                    const icon = "/assets/images/icons/human1.png";

                    const transaction: Transaction = {
                        type,
                        date,
                        amount,
                        recipient: partnerName,
                        status,
                        message: messageText,
                        icon
                    };
                    
                    if (!acc[period]) {
                        acc[period] = { period, transactions: [] };
                    }
                    acc[period].transactions.push(transaction);
                    return acc;
                }, {});

                // オブジェクトを配列に変換してstateにセット
                const finalData = Object.values(groupedData);
                setTransactionData(finalData);

            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('不明なエラーが発生しました');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchTransactionData();
    }, []);

    if (isLoading) {
        return <div className="p-4 text-center">データを読み込み中...</div>;
    }

    if (error) {
        return <div className="p-4 text-center text-rose-500">エラー: {error}</div>;
    }

    return (
        <div className="mx-auto h-screen bg-gray-100 shadow-lg rounded-3xl overflow-y-auto flex flex-col">
            <div className="w-full bg-white p-6 text-center shadow-sm">
                <h1 className="text-xl font-bold">履歴</h1>
            </div>

            <div className="p-6 flex-grow">
                {transactionData.slice().reverse().map((periodSection) => (
                    <div key={periodSection.period} className="mb-6">
                        <h2 className="text-sm text-gray-600 font-bold mb-3">{periodSection.period}</h2>
                        {periodSection.transactions.slice().reverse().map((transaction, index) => (
                            <TransactionCard key={index} transaction={transaction} />
                        ))}
                    </div>
                ))}
            </div>

            <div className="p-6">
                <button
                    onClick={() => navigate('/top')}
                    className="w-full font-bold py-4 rounded-full shadow-lg transition-colors duration-200 bg-white text-gray-800 hover:bg-gray-200"
                >
                    トップに戻る
                </button>
            </div>
        </div>
    );
}

export default TransactionHistory;