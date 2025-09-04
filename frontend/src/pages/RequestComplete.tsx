// frontend/src/pages/RequestComplete.tsx
import { useNavigate, useLocation } from "react-router-dom";

function RequestComplete() {
  const navigate = useNavigate();
  const location = useLocation();
  const recipient = (location.state as any)?.recipient;
  const amount: number | undefined = (location.state as any)?.amount;
  const message: string | undefined = (location.state as any)?.message;

  const name = recipient?.name ?? "相手";
  const formattedAmount =
    typeof amount === "number" ? amount.toLocaleString() : "--";

  return (
    <div className="mx-auto h-screen bg-orange-50 shadow-lg rounded-3xl overflow-hidden flex flex-col justify-center items-center py-20 px-6">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-40 w-40 items-center justify-center rounded-full bg-blue-100 p-4">
          <img
            src="/assets/images/icons/check.svg"
            alt="完了アイコン"
            className="h-40 w-40"
          />
        </div>
        <p className="text-xl font-bold text-gray-800 mt-2">請求完了</p>
      </div>

      <div className="flex items-center text-center p-6 mt-8">
        <img
          src="/assets/images/icons/human1.png"
          alt={name}
          className="w-32 h-32 rounded-full mr-4"
        />
        <p className="text-lg text-gray-800 text-left">
          {formattedAmount} 円を<br />
          {name} さんに<br />
          請求しました
          {message ? (
            <>
              <br />
              （メッセージ: {message}）
            </>
          ) : null}
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default RequestComplete;