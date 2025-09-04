import { useNavigate } from "react-router-dom";

const BackButton: React.FC<{ label?: string }> = ({ label = "戻る" }) => {
  const navigate = useNavigate();
  return (
    <button onClick={() => navigate(-1)}>
    <img
        src="/assets/images/icons/chevron-left.png"
        alt="戻る"
        className="w-6 h-6"
    />
    </button>
  );
};

export default BackButton;