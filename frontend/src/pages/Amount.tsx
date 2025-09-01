function Amount() {
    return (
        <div className="mx-auto h-screen bg-orange-50 shadow-lg rounded-3xl overflow-hidden flex flex-col">
        <div className="p-6 text-center ">
            <div className="flex items-center">
            <img
                src="/assets/images/icons/human1.png"
                alt="田中一郎"
                className="w-32 h-32 rounded-full mb-4"
            />
            <div className="flex flex-col ml-10">
                <p className="text-xl text-gray-800">田中一郎さんに</p>
                <p className="text-xl text-gray-800 font-bold">送金する</p>
            </div>
            </div>
        </div>

        <div className="flex-grow p-6">
            <form className="space-y-6">
            <div>
                <label
                htmlFor="transfer-limit"
                className="block text-sm font-medium text-gray-500 mb-1"
                >
                送金上限額
                </label>
                <div className="relative">
                <input
                    type="text"
                    id="transfer-limit"
                    value="15,000 円"
                    className="block w-full rounded-md border-gray-300 shadow-sm p-4 text-gray-900 text-lg font-bold bg-white"
                    readOnly
                />
                </div>
            </div>

            <div>
                <label
                htmlFor="amount"
                className="block text-sm font-medium text-gray-500 sr-only"
                >
                送る金額
                </label>
                <input
                type="text"
                id="amount"
                placeholder="送る金額"
                className="block w-full rounded-md border-gray-300 shadow-sm p-4 text-lg bg-white"
                />
            </div>

            <div>
                <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-500 sr-only"
                >
                メッセージ(任意)
                </label>
                <textarea
                id="message"
                placeholder="メッセージ(任意)"
                className="block w-full rounded-md border-gray-300 shadow-sm p-4 text-lg bg-white resize-none"
                ></textarea>
            </div>

            <div className="mt-8">
                <button
                type="submit"
                className="w-full bg-rose-500 text-white font-bold p-4 rounded-md shadow-lg hover:bg-rose-600 transition-colors duration-200"
                >
                送金する
                </button>
            </div>
            </form>
        </div>
        </div>
    );
}

export default Amount;
