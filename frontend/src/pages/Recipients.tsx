function Recipients() {
    return (
        <div className="mx-auto h-screen bg-orange-50">
        <header className="bg-rose-400 text-white p-4 text-center text-lg font-bold">
            送金相手を選択
        </header>

        <ul className="divide-y divide-gray-200 flex flex-col">
            <li className="flex items-center p-4">
                <img
                    src="/assets/images/icons/human1.png"
                    alt="サンプル Aさん"
                    className="w-20 h-20 rounded-full mr-4"
                />
                <span className="text-gray-800 text-lg">サンプル Aさん</span>
            </li>
                        <li className="flex items-center p-4">
                <img
                    src="/assets/images/icons/human1.png"
                    alt="サンプル Aさん"
                    className="w-20 h-20 rounded-full mr-4"
                />
                <span className="text-gray-800 text-lg">サンプル Aさん</span>
            </li>
                        <li className="flex items-center p-4">
                <img
                    src="/assets/images/icons/human1.png"
                    alt="サンプル Aさん"
                    className="w-20 h-20 rounded-full mr-4"
                />
                <span className="text-gray-800 text-lg">サンプル Aさん</span>
            </li>
        </ul>
    </div>
);

}

export default Recipients;
