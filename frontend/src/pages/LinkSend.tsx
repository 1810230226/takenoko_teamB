import React, { useState, useEffect } from "react";
// import { useSearchParams } from "react-router-dom";
import { useSearchParams, useNavigate } from "react-router-dom"; 
import toast from 'react-hot-toast'


function CreateLink() {
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");
  const navigate = useNavigate();

  const [link, setLink] = useState("");
  const [amount, setAmount] = useState<number | null>(null); // 金額用の state
  const [loading, setLoading] = useState(true); // ローディング管理
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      setLink(`http://localhost:3000/linklogin?id=${id}`);

      // サーバーから request_link を取得
      fetch(`http://localhost:5001/api/request-links/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("リンク情報の取得に失敗しました!");
          return res.json();
        })
        .then((data) => {
          setAmount(data.amount); // amount を state にセット
          setLoading(false);
        })
        .catch((err) => {
          setError("リンク情報の取得に失敗しました");
          setLoading(false);
        });
    }
  }, [id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(link).then(() => {
      toast.success("リンクをコピーしました！");
    });
  };

const handleGoTop = () => {
    navigate("/top"); // ← ここでトップに遷移
  };

  if (!id) {
    return (
      <div className="mx-auto h-screen flex items-center justify-center">
        <p>リンクが見つかりませんでした。</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto h-screen flex items-center justify-center">
        <p>読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto h-screen flex items-center justify-center">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-6 font-sans">
      <div className="flex w-full max-w-sm flex-grow flex-col items-center justify-center">
        {/* Icon Section */}
    <div className="flex h-40 w-40 items-center justify-center rounded-full bg-green-100 p-4">
        <img src="/assets/images/icons/link.svg" alt="リンクアイコン" className="h-40 w-40" />
    </div>

        {/* Text Section */}
        <div className="mt-8 text-center">
          <h1 className="text-xl font-medium text-gray-800">リンク作成完了</h1>
          <p className="mt-4 text-4xl font-semibold text-gray-800">
            {amount?.toLocaleString()} 円
          </p>
          <p className="mt-2 text-base text-gray-500">送信リンクが作成されました</p>
        </div>
      </div>

      {/* Buttons Section */}
      <div className="mb-8 w-full max-w-sm space-y-4">
        <button
          onClick={handleCopy}
          className="flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white py-4 font-medium text-gray-700 shadow-sm transition-colors duration-200 hover:bg-gray-100"
        >
          <span className="text-base">リンクをコピー</span>
          {/* <DocumentDuplicateIcon className="ml-2 h-5 w-5 text-gray-500" /> */}
        </button>

        <button onClick={handleGoTop}  className="flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white py-4 font-medium text-gray-700 shadow-sm transition-colors duration-200 hover:bg-gray-100">
          <span className="text-base">トップに戻る</span>
          {/* <ChevronRightIcon className="ml-2 h-5 w-5 text-gray-500" /> */}
        </button>
      </div>
    </div>
  );
}

export default CreateLink;