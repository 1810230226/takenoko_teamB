import React, { useState, useRef, useEffect } from 'react';
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
    status: "済み" | "支払い待ち" | "キャンセル";
    isRead: boolean;
};

// ----------------------------------------------------
// 型定義は前回の回答と同じ
// ----------------------------------------------------
interface Message {
    type: "receive" | "send" | "request";
    time: string;
    amount: number;
    status: "済み" | "支払い待ち" | "キャンセル";
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
    onCancel?: (amount: number) => void;
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
const MessageCard: React.FC<MessageCardProps> = ({ message, isReceived, onPay, onCancel }) => {
    const { type, time, amount, status, message: text, isRead } = message;

    // 受信表示かどうかは親から渡された isReceived を優先
    const isSent = !isReceived;

    const isPureText = type !== "request" && amount <= 0;

    // --- Avatars (LINE-style) ---
    // 受信（左側）には相手のアイコン、送信（右側）には自分のアイコンを表示
    const { user } = useUser();
    const locationInCard = useLocation();
    const recipientInCard = (locationInCard.state as any)?.recipient;
    const otherAvatar = recipientInCard?.icon_pass || "/assets/images/icons/human1.png";
    const selfAvatar = (user as any)?.icon_pass || "/assets/images/icons/human1.png";

    const statusClasses = (() => {
        switch (status) {
            case "済み":
                return "bg-green-500 text-white";
            case "支払い待ち":
                return "bg-rose-500 text-white";
            case "キャンセル":
                return "bg-gray-400 text-white";
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
        type === "request"
            ? (isReceived && status === "支払い待ち" ? "送金する" : "請求")
            : (isReceived ? "受け取る" : "送る");

    // 相手側で受信として表示される「請求」メッセージかつ未払いなら背景を変更
    const bubbleColorClass =
        type === "request" && isReceived && status === "支払い待ち"
            ? "bg-rose-400 text-white"
            : status === "キャンセル"
            ? "bg-gray-300 text-gray-800"
            : "bg-white";

    const formatAmount = (num: number) => num.toLocaleString("ja-JP");
    const containerClasses = isSent ? "items-end" : "items-start";

    return (
        <div className={`flex flex-col ${containerClasses}`}>
            {isSent && (type === "request" || amount > 0) && !isRead && (
                <span className="text-xs text-gray-500 mb-1 mr-2">未読</span>
            )}
            {isSent && (type === "request" || amount > 0) && isRead && (
                <span className="text-xs text-gray-500 mb-1 mr-2">既読</span>
            )}
            <div className={`flex items-end ${isSent ? 'flex-row-reverse' : 'flex-row'}`}>
                {/* Avatar */}
                <img
                    src={isSent ? selfAvatar : otherAvatar}
                    alt="avatar"
                    className={`w-8 h-8 rounded-full object-cover ${isSent ? 'ml-2' : 'mr-2'}`}
                />
                {/* Bubble */}
                <div className={`${bubbleColorClass} rounded-lg shadow-md p-4 mb-2 w-64 flex-shrink-0`}>
                    <div className="flex justify-between items-center mb-2">
                        {(type === "request" || amount > 0) && (
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${typeClasses}`}>
                                {labelText}
                            </span>
                        )}
                        {(type === "request" || amount > 0) && (
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${statusClasses}`}>
                                {status}
                            </span>
                        )}
                    </div>
                    {(type === "request" || amount > 0) && (
                        <div className="text-xl font-bold text-gray-800 my-2 text-center">{formatAmount(amount)}円</div>
                    )}
                    {text && isPureText && (
                        <div className="text-base font-semibold text-gray-800">
                            {text}
                        </div>
                    )}
                    {text && !isPureText && (
                        <div className={`text-sm ${
                            type === "request" && isReceived && status === "支払い待ち"
                                ? "text-gray-200"
                                : "text-gray-700"
                        } border-t border-gray-200 pt-2 mt-2`}>
                            {text}
                        </div>
                    )}
                    {type === "request" && isReceived && status === "支払い待ち" && (
                        <div className="mt-3 flex gap-2">
                            <button
                                onClick={() => onCancel && onCancel(amount)}
                                className="flex-1 font-bold py-2 rounded-md shadow hover:opacity-90 transition bg-gray-300 text-gray-800"
                            >
                                キャンセル
                            </button>
                            <button
                                onClick={() => onPay && onPay(amount)}
                                className="flex-1 font-bold py-2 rounded-md shadow hover:opacity-90 transition bg-rose-500 text-white"
                            >
                                送金する
                            </button>
                        </div>
                    )}
                    {type === "request" && isReceived && status === "キャンセル" && (
                        <div className="mt-3 w-full text-center text-sm font-bold text-gray-700">
                            キャンセルしました
                        </div>
                    )}
                </div>
                {/* Time */}
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

    const [refresh, setRefresh] = useState(0);
    const [text, setText] = useState("");
    const scrollRef = useRef<HTMLDivElement | null>(null);

    const handleCancel = (amount: number) => {
        if (!recipient) return;
        try {
            const all = JSON.parse(localStorage.getItem("app_messages") || "[]");
            for (let i = all.length - 1; i >= 0; i--) {
                const r = all[i];
                if (
                    r &&
                    r.type === "request" &&
                    r.fromId === (recipient?.id) && // 請求者
                    r.toId === (user?.id) &&        // 自分 = 受信者
                    r.amount === amount &&
                    r.status === "支払い待ち"
                ) {
                    all[i].status = "キャンセル";
                    break;
                }
            }
            localStorage.setItem("app_messages", JSON.stringify(all));
            setRefresh((v) => v + 1); // 再描画
        } catch (e) {
            console.warn("failed to cancel request message:", e);
        }
    };

    const handlePay = (amount: number) => {
        if (!recipient) return;
        navigate("/remit", { state: { recipient, amount } });
    };

    const handleSend = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const body = text.trim();
        if (!body || !recipient || !user) return;
        try {
            const all = JSON.parse(localStorage.getItem("app_messages") || "[]");
            all.push({
                fromId: user.id,
                toId: recipient.id,
                type: "send",
                amount: 0,
                message: body,
                timeISO: new Date().toISOString(),
                status: "済み",
                isRead: true,
            });
            localStorage.setItem("app_messages", JSON.stringify(all));
            setText("");
            setRefresh((v) => v + 1);
        } catch (err) {
            console.warn("failed to send text message:", err);
        }
    };

    const { user } = useUser();

    useEffect(() => {
        if (!user || !recipient) return;
        try {
            const all = JSON.parse(localStorage.getItem("app_messages") || "[]");
            let changed = false;
            for (let i = 0; i < all.length; i++) {
                const r = all[i];
                if (
                    r &&
                    r.toId === user.id &&
                    r.fromId === recipient.id &&
                    r.isRead === false
                ) {
                    all[i].isRead = true;
                    changed = true;
                }
            }
            if (changed) {
                localStorage.setItem("app_messages", JSON.stringify(all));
                try { window.dispatchEvent(new Event("storage")); } catch {}
                setRefresh((v) => v + 1);
            }
        } catch (e) {
            console.warn("failed to mark messages as read:", e);
        }
    }, [user, recipient]);

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
        const isReceivedForViewer = user ? toId === user.id : false;

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

    useEffect(() => {
        const el = scrollRef.current;
        if (el) {
            el.scrollTop = el.scrollHeight;
        }
    }, [scrollRef, groups.length, refresh]);

    return (
        <div className="mx-auto h-screen bg-gray-100 shadow-lg overflow-hidden flex flex-col">
            <div className="w-full bg-green-500 p-4 text-center text-white flex items-center justify-center relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <div className="w-6">
                        <BackButton />
                    </div>
                </div>
                <img
                    src={recipient?.icon_pass || "/assets/images/icons/human1.png"}
                    alt={headerName}
                    className="w-8 h-8 rounded-full mr-2 object-cover"
                />
                <h1 className="text-xl font-bold">{headerName}</h1>
            </div>

            <div ref={scrollRef} className="p-4 flex-grow overflow-y-auto">
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
                                    onCancel={msg.type === "request" && isReceived && msg.status === "支払い待ち" ? handleCancel : undefined}
                                />
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* 送信用フォーム（「トップに戻る」の上） */}
            <div className="p-3 bg-white shadow-inner border-t">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="メッセージを入力"
                        className="flex-1 border rounded-full px-4 py-2 text-sm"
                    />
                    <button
                        type="submit"
                        disabled={!text.trim()}
                        className={`px-4 py-2 rounded-full font-bold ${text.trim() ? "bg-green-500 text-white hover:bg-green-600" : "bg-gray-300 text-gray-500 cursor-not-allowed"}`}
                    >
                        送信
                    </button>
                </form>
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