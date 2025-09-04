import { Link } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { useUser } from "../context/UserContext";
import toast from 'react-hot-toast'

function Top() {
    const { user, setUser } = useUser();
    const [showBalance, setShowBalance] = useState(true);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showOverdue, setShowOverdue] = useState(false);
    const [overdueCount, setOverdueCount] = useState(0);
    const alertTimerRef = useRef<number | null>(null);
    // 閉じる押下時刻の記憶用ref
    const dismissedAtRef = useRef<number>((() => {
        try {
            return parseInt(localStorage.getItem("overdue_dismissed_at") || "0", 10) || 0;
        } catch {
            return 0;
        }
    })());


    useEffect(() => {
        fetch(`http://localhost:5001/api/users/${user?.id}`)  // ← id を指定
            .then((res) => res.json())
            .then((data) => {
                setUser(data)
                
            })
            .catch((err) => console.error("Error fetching user:", err));

    }, [user]);
    useEffect(() => {
        const calc = () => {
            try {
                const all = JSON.parse(localStorage.getItem("app_messages") || "[]");
                const uid = user?.id;
                if (!uid) {
                    setUnreadCount(0);
                    setOverdueCount(0);
                    setShowOverdue(false);
                    return;
                }

                // 未読メッセージ件数（自分宛・isRead=false をカウント）
                const unread = all.filter(
                    (r: any) => r && r.toId === uid && r.isRead === false
                );
                setUnreadCount(unread.length);

                // 自分宛の未払い請求だけを抽出（30秒警告用）
                const pending = all.filter(
                    (r: any) =>
                        r &&
                        r.toId === uid &&
                        r.type === "request" &&
                        r.status === "支払い待ち"
                );

                // 30秒経過で警告に昇格
                const now = Date.now();
                const overdue = pending.filter((r: any) => {
                    const t = new Date(r.timeISO).getTime();
                    return Number.isFinite(t) && now - t >= 30_000;
                });

                // 「閉じる」押下時点より古いものは一旦スヌーズ
                const dismissedAt = dismissedAtRef.current || 0;
                const overdueNew = overdue.filter((r: any) => {
                    const t = new Date(r.timeISO).getTime();
                    return t > dismissedAt;
                });

                setOverdueCount(overdueNew.length);
                setShowOverdue(overdueNew.length > 0);

                // 次に警告が発火するまでの残り時間を予約（dismiss後に新しく来る請求のみ対象）
                if (alertTimerRef.current) {
                    clearTimeout(alertTimerRef.current as unknown as number);
                    alertTimerRef.current = null;
                }
                const eligible = pending.filter((r: any) => {
                    const t = new Date(r.timeISO).getTime();
                    return t > dismissedAt;
                });
                if (overdueNew.length === 0 && eligible.length > 0) {
                    const delays = eligible
                        .map((r: any) => {
                            const t = new Date(r.timeISO).getTime();
                            const elapsed = now - t;
                            return Math.max(0, 30_000 - elapsed);
                        })
                        .filter((ms: number) => Number.isFinite(ms));
                    if (delays.length > 0) {
                        const nextMs = Math.min(...delays);
                        alertTimerRef.current = window.setTimeout(calc, nextMs + 50);
                    }
                }
            } catch {
                setUnreadCount(0);
                setOverdueCount(0);
                setShowOverdue(false);
            }
        };
        calc();
        window.addEventListener("focus", calc);
        window.addEventListener("storage", calc);
        return () => {
            window.removeEventListener("focus", calc);
            window.removeEventListener("storage", calc);
            if (alertTimerRef.current) {
                clearTimeout(alertTimerRef.current as unknown as number);
                alertTimerRef.current = null;
            }
        };
    }, [user]);

    return (
        <>
            {showOverdue && (
                <div className="fixed top-0 left-0 right-0 z-20 bg-rose-600 text-white text-sm font-bold py-2 px-4 flex items-center justify-center shadow">
                    <span className="mr-2">⚠️ {overdueCount}件の未支払いがあります</span>
                    <button
                        onClick={() => {
                            setShowOverdue(false);
                            const now = Date.now();
                            dismissedAtRef.current = now;
                            try { localStorage.setItem("overdue_dismissed_at", String(now)); } catch {}
                        }}
                        className="ml-3 bg-white/20 hover:bg-white/30 rounded px-2 py-0.5"
                    >
                        閉じる
                    </button>
                </div>
            )}
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
                        <p className="text-sm text-gray-500">口座番号 : {user ? user.account_number.toString().padStart(7, "0") : "------"}</p>
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
                        履歴
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
                    state={{ excludeUserId: user?.id }}
                    className="relative flex items-center w-full max-w-md px-6 py-4 bg-white text-black font-bold rounded-xl text-lg border-2 border-gray mb-5"
                >
                    {unreadCount > 0 && (
                        <span className="absolute left-3 -top-3 z-10 bg-green-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                    )}
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
