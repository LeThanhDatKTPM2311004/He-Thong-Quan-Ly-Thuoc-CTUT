import { useNavigate } from "react-router-dom";
import FormLogin from "../components/FormLogin.jsx";
import AuthLayout from "../layouts/AuthLayout.jsx";
import { isAuthenticated } from "../services/authService";
import { useEffect } from "react";

export default function Login() {
  const navigate = useNavigate();
  useEffect(() => {
    const check = async () => {
      const loggedIn = await isAuthenticated();
      if (loggedIn) navigate("/account", { replace: true });
    };
    check();
  }, []);

  const handleLoginSuccess = (data) => {
    const role = data.account?.role;
    if (role === "ADMIN") {
      navigate("/account");
    } else {
      navigate("/personal");
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col w-full items-center justify-center absolute top-[62%]">
        <div className="flex flex-col text-white items-center justify-center mb-7">
          <h1 className="text-center text-5xl black-ops-one">
            HỆ THỐNG QUẢN LÍ THUỐC
          </h1>
          <h2 className="text-sm italic">
            Phòng Y Tế - Trường Đại học Kỹ Thuật Công Nghệ Cần Thơ
          </h2>
        </div>
        <FormLogin onSuccess={handleLoginSuccess} />
      </div>
    </AuthLayout>
  );
}
