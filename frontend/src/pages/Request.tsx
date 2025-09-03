import BackButton from "../components/BackButton";
function Request() {
    return (
        <div className="mx-auto h-screen bg-white shadow-lg flex flex-col">
        <header className="bg-cyan-600 text-white p-4 font-bold text-lg grid grid-cols-[auto_1fr_auto] items-center">
        {/* 左：戻るボタン */}
        <div className="w-6">
            <BackButton />
        </div>

        {/* 中央：タイトル */}
        <h1 className="text-center">請求リンクの作成</h1>

        {/* 右：ダミー（中央を保つため） */}
        <div className="w-6" aria-hidden />
        </header>
        <div className="p-6 flex-grow flex flex-col justify-between">
            <form className="space-y-6">
            <div>
                <label
                htmlFor="request-amount"
                className="block text-gray-500 font-medium mb-2"
                >
                請求金額
                </label>
                <input
                type="text"
                id="request-amount"
                defaultValue="15,000 円"
                className="block w-full rounded-md border-gray-300 shadow-sm p-4 text-lg text-gray-900 font-bold bg-gray-100"
                />
            </div>

            <div>
                <label
                htmlFor="message"
                className="block text-gray-500 font-medium mb-2"
                >
                メッセージ (任意)
                </label>
                <textarea
                id="message"
                rows={4}
                className="block w-full rounded-md border-gray-300 shadow-sm p-4 text-lg bg-gray-100 resize-none"
                ></textarea>
            </div>
            </form>

            <div className="mt-auto">
            <button className="w-full bg-rose-500 text-white font-bold p-4 rounded-md shadow-lg hover:bg-rose-600 transition-colors duration-200">
                リンクを作成
            </button>
            </div>
        </div>
        </div>
    );
}

export default Request;
