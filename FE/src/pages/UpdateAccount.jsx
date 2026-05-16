import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import FormAccount from "../components/FormAccount";
import { getAccountById } from "../services/listAccountService";

export default function UpdateAccount() {
  const location = useLocation();
  const navigate = useNavigate();
  const id = location.state?.id; // nhận id từ Account.jsx khi navigate

  const [initialData, setInitialData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      navigate("/account");
      return;
    }
    const fetch = async () => {
      try {
        const data = await getAccountById(id);
        setInitialData(data);
      } catch (err) {
        setError(err.message || "Không thể tải thông tin tài khoản.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id]);

  if (loading)
    return <p className="text-center mt-20 text-gray-400">Đang tải...</p>;
  if (error) return <p className="text-center mt-20 text-red-500">{error}</p>;

  return <FormAccount title="CẬP NHẬT TÀI KHOẢN" initialData={initialData} />;
}
