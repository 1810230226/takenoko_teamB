import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BackButton from "../components/BackButton";

// ----------------------------------------------------
// 型定義は前回の回答と同じ
// ----------------------------------------------------
interface Message {
    type: "receive" | "send" | "request";
    time: string;
    amount: number;
    status: "済み" | "支払い待ち";
    message: string | null;
    isRead: boolean;
}

interface ChatGroup {
    date: string;
    messages: Message[];
}

interface MessageCardProps {
    message: Message;
    isReceived: boolean;
}

// ----------------------------------------------------
// ダミーデータは前回の回答と同じ
// ----------------------------------------------------
const chatData: ChatGroup[] = [
    {
        date: "2025年 1月1日",
        messages: [
            {
                type: "receive",
                time: "10時 37分",
                amount: 10000,
                status: "済み",
                message: "あけましておめでとうございます！お年玉です！",
                isRead: true,
            }
        ],
    },
    {
        date: "2025年 8月12日",
        messages: [
            {
                type: "send",
                time: "23時 39分",
                amount: 5000,
                status: "済み",
                message: "飲み会代です。",
                isRead: true,
            }
        ],
    },
    {
        date: "2025年 9月2日",
        messages: [
            {
                type: "request",
                time: "22時 59分",
                amount: 5000,
                status: "支払い待ち",
                message: "今日の飲み会代をお願いします。",
                isRead: false,
            }
        ],
    },
];

// ----------------------------------------------------
// MessageCard コンポーネントの修正
// ----------------------------------------------------
const MessageCard: React.FC<MessageCardProps> = ({ message, isReceived }) => {
    const { type, time, amount, status, message: text, isRead } = message;

    const isSent = type === "send" || type === "request";
    const statusClasses = (() => {
        switch (status) {
            case "済み":
                return "bg-green-500 text-white";
            case "支払い待ち":
                return "bg-rose-500 text-white";
            default:
                return "";
        }
    })();

    const typeClasses = (() => {
        switch (type) {
            case "receive":
                return "bg-rose-500 text-white";
            case "send":
                return "bg-rose-500 text-white";
            case "request":
                return "bg-cyan-500 text-white";
            default:
                return "";
        }
    })();
    
    const formatAmount = (num: number) => num.toLocaleString("ja-JP");
    const containerClasses = isSent ? "items-end" : "items-start";

    return (
        <div className={`flex flex-col ${containerClasses}`}>
            {isSent && !isRead && (
                <span className="text-xs text-gray-500 mb-1 mr-2">未読</span>
            )}
            {isSent && isRead && (
                <span className="text-xs text-gray-500 mb-1 mr-2">既読</span>
            )}
            
            <div className={`flex items-center ${isSent ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* 変更箇所: w-64 を追加して幅を固定 */}
                <div className={`bg-white rounded-lg shadow-md p-4 mb-2 w-64 flex-shrink-0`}>
                    <div className="flex justify-between items-center mb-2">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${typeClasses}`}>
                            {type === "receive" ? "受け取る" : type === "send" ? "送る" : "請求"}
                        </span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusClasses}`}>
                            {status}
                        </span>
                    </div>
                    <div className="text-xl font-bold text-gray-800 my-2 text-center">{formatAmount(amount)}円</div>
                    {text && (
                        <div className="text-xs text-gray-500 border-t border-gray-200 pt-2 mt-2">
                            {text}
                        </div>
                    )}
                </div>
                <div className={`flex flex-col justify-end ${isSent ? 'mr-2' : 'ml-2'}`}>
                    <span className="text-sm text-gray-500">{time}</span>
                </div>
            </div>
        </div>
    );
};

// ----------------------------------------------------
// ChatScreen コンポーネントは変更なし
// ----------------------------------------------------
const ChatScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const recipient = (location.state as any)?.recipient;
    const headerName = recipient?.name ?? "メッセージ";

    return (
        <div className="mx-auto h-screen bg-gray-100 shadow-lg overflow-hidden flex flex-col">
            <div className="w-full bg-green-500 p-4 text-center text-white flex items-center justify-center relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <div className="w-6">
                        <BackButton />
                    </div>
                </div>
                <img src="/assets/images/icons/human2.png" alt="User Icon" className="w-8 h-8 rounded-full mr-2" />
                <h1 className="text-xl font-bold">{headerName}</h1>
            </div>

            <div className="p-4 flex-grow overflow-y-auto">
                {chatData.map((day, dayIndex) => (
                    <div key={dayIndex} className="mb-6">
                        <div className="text-center text-sm text-gray-500 my-4">{day.date}</div>
                        {day.messages.map((msg, msgIndex) => (
                            <MessageCard
                                key={msgIndex}
                                message={msg}
                                isReceived={msg.type === "receive"}
                            />
                        ))}
                    </div>
                ))}
            </div>

            <div className="p-4 bg-white shadow-inner">
                <button
                    onClick={() => navigate('/top')}
                    className="w-full font-bold py-4 rounded-full shadow-lg transition-colors duration-200 bg-white text-gray-800 hover:bg-gray-200"
                >
                    トップに戻る
                </button>
            </div>
        </div>
    );
};

export default ChatScreen;