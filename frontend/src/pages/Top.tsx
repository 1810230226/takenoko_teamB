function Top() {

    return (
        <>
            <div className="flex items-center w-full p-4  bg-white">
                {/* ユーザー画像 */}
                <img
                    src="/assets/images/icons/human1.png"
                    alt="ユーザー画像"
                    className="w-16 h-16 rounded-full"
                />

                {/* 名前とID */}
                <div className="ml-4">
                    <p className="text-sm text-gray-500">口座番号 : 0000000</p>
                    <p className="text-lg font-bold">田中 一郎</p>
                </div>
            </div>
            
            <div className="flex justify-center gap-4 mb-5">
                <button className="flex-1 px-6 py-4 bg-white text-black font-bold rounded-xl text-lg border-2 border-black">
                    送金
                </button>
                <button className="flex-1 px-6 py-4 bg-white text-black font-bold rounded-xl text-lg border-2 border-black">
                    請求
                </button>
            </div>
            <p>預金残高</p>
            <p className="w-full max-w-md px-6 py-4 bg-white-500 text-black font-bold rounded-xl text-lg border-black border-2 border-black mb-5">100,000</p>
            <button
                className="w-full max-w-md px-6 py-4 bg-white-500 text-black font-bold rounded-xl text-lg border-black border-2 border-black mb-5"
            >
                請求履歴
            </button>
            <button
                className="w-full max-w-md px-6 py-4 bg-white-500 text-black font-bold rounded-xl text-lg border-2 border-black mb-5"
            >
                メッセージを見る
            </button>
        </>
    );
}

export default Top;