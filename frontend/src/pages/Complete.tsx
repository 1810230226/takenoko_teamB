import { useNavigate, useLocation } from "react-router-dom";

interface LocationState {
  amount: number;
  recipientName: string;
}

function Complete() {
    const navigate = useNavigate();
    const location = useLocation();
    const { recipientName } = location.state || {};
    const { amount } = location.state || {};

  // 金額を3桁ごとにカンマ区切り
    const formattedAmount = amount.toLocaleString();

    return (
        <div className="mx-auto h-screen bg-orange-50 shadow-lg rounded-3xl overflow-hidden flex flex-col justify-center items-center py-20 px-6">
        <div className="flex flex-col items-center text-center">
            <div className="bg-green-100 rounded-full p-4 mb-4">
            <svg
                className="w-40 h-40 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >

            </svg>
            </div>
            <p className="text-xl font-bold text-gray-800">送金完了</p>
        </div>

        <div className="flex items-center text-center p-6 mt-8">
            <img
            src="/assets/images/icons/human1.png"
            alt={recipientName}
            className="w-32 h-32 rounded-full mr-4"
            />
            <p className="text-lg text-gray-800 text-left">
            {formattedAmount} 円 を
            <br />
            {recipientName}さんに
            <br />
            送金しました
            </p>
        </div>

        <div className="w-full mt-auto">
            <button
            onClick={() => navigate("/top")}
            className="w-full flex items-center justify-center bg-white border border-gray-300 rounded-lg p-4 text-gray-800 text-lg font-bold shadow-sm hover:bg-gray-50 transition-colors duration-200"
            >
            トップに戻る
            <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5l7 7-7 7"
                />
            </svg>
            </button>
        </div>
        </div>
    );
}

export default Complete;
