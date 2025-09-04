import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import BackButton from "../components/BackButton";
import { useUser } from "../context/UserContext";
type LSRecord = {
    fromId: number | undefined;
    toId: number | undefined;
    type: "receive" | "send" | "request";
    amount: number;
    message?: string;
    timeISO: string; // ISO timestamp
    status: "済み" | "支払い待ち";
    isRead: boolean;
};

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
    // ビュー側（自分）から見て左側に出すかどうか
    isReceivedForViewer?: boolean;
}

interface ChatGroup {
    date: string;
    messages: Message[];
}

interface MessageCardProps {
    message: Message;
    isReceived: boolean;
    onPay?: (amount: number) => void;
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
const MessageCard: React.FC<MessageCardProps> = ({ message, isReceived, onPay }) => {
    const { type, time, amount, status, message: text, isRead } = message;

    // 受信表示かどうかは親から渡された isReceived を優先
    const isSent = !isReceived;

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

    const labelText =
        type === "receive"
            ? "受け取る"
            : type === "send"
            ? "送る"
            : (isReceived ? "送金する" : "請求"); // 相手側（受信側）のみ「送金する」に見せる

    // 相手側で受信として表示される「請求」メッセージだけ背景を変更
    const bubbleColorClass =
        type === "request" && isReceived ? "bg-rose-400 text-white" : "bg-white";

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
                <div className={`${bubbleColorClass} rounded-lg shadow-md p-4 mb-2 w-64 flex-shrink-0`}>
                    <div className="flex justify-between items-center mb-2">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${typeClasses}`}>
                            {labelText}
                        </span>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusClasses}`}>
                            {status}
                        </span>
                    </div>
                    <div className="text-xl font-bold text-gray-800 my-2 text-center">{formatAmount(amount)}円</div>
                    {text && (
                        <div className={`text-xs ${type === "request" && isReceived ? "text-gray-200" : "text-gray-500"} border-t border-gray-200 pt-2 mt-2`}>
                            {text}
                        </div>
                    )}
                    {type === "request" && isReceived && onPay && (
                        <button
                            onClick={() => onPay(amount)}
                            className="mt-3 w-full font-bold py-2 rounded-md shadow hover:opacity-90 transition bg-rose-500 text-white"
                        >
                            送金する
                        </button>
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
// ChatScreen コンポーネント
// ----------------------------------------------------
const ChatScreen = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const recipient = (location.state as any)?.recipient;
    const headerName = recipient?.name ?? "メッセージ";

    const handlePay = (amount: number) => {
        if (!recipient) return;
        navigate("/remit", { state: { recipient, amount } });
    };

    const { user } = useUser();

    // localStorage に保存されたメッセージから、相手とのスレッドを作る
    const raw: LSRecord[] = (() => {
        try {
            return JSON.parse(localStorage.getItem("app_messages") || "[]");
        } catch {
            return [];
        }
    })();

    const pair = raw.filter(
        (r) =>
            user &&
            recipient &&
            ((r.fromId === user.id && r.toId === recipient.id) ||
                (r.fromId === recipient.id && r.toId === user.id))
    );

    const mapped = pair.map(({ timeISO, type, amount, status, message, fromId, toId }) => {
        const d = new Date(timeISO);
        const date = `${d.getFullYear()}年 ${d.getMonth() + 1}月${d.getDate()}日`;
        const time = `${d.getHours()}時 ${String(d.getMinutes()).padStart(2, "0")}分`;

        // 「請求」は相手側（toId === user.id）の画面では“受信（左側）”として扱う
        const isReceivedForViewer =
            type === "request"
                ? (user ? toId === user.id : false)
                : type === "receive";

        const msg: Message = {
            type,
            time,
            amount,
            status,
            message: message ?? null,
            isRead: false,
            isReceivedForViewer,
        };
        return { date, msg };
    });

    const dynamicGroups: ChatGroup[] = [];
    for (const { date, msg } of mapped) {
        let g = dynamicGroups.find((g) => g.date === date);
        if (!g) {
            g = { date, messages: [] };
            dynamicGroups.push(g);
        }
        g.messages.push(msg);
    }

    // 既存のダミー会話とマージして表示
    const groups: ChatGroup[] = [...chatData, ...dynamicGroups];

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
                {groups.map((day, dayIndex) => (
                    <div key={dayIndex} className="mb-6">
                        <div className="text-center text-sm text-gray-500 my-4">{day.date}</div>
                        {day.messages.map((msg, msgIndex) => {
                            const isReceived = msg.isReceivedForViewer ?? (msg.type === "receive");
                            const payHandler = msg.type === "request" && isReceived ? handlePay : undefined;
                            return (
                                <MessageCard
                                    key={msgIndex}
                                    message={msg}
                                    isReceived={isReceived}
                                    onPay={payHandler}
                                />
                            );
                        })}
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