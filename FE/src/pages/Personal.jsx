import avatar from "../assets/images/avatar.png";
import avatarsmall from "../assets/images/avatarsmall.png";
import MailIcon from "../assets/svg/MailIcon.jsx";
import ChangePass from "../assets/svg/ChangePass.jsx";
import Button from "../components/Button.jsx";
import Logout from "../assets/svg/LogoutIcon.jsx";
import Table from "../components/Table/Table.jsx";
import FormChangePass from "../components/FormChangePass.jsx";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProfile, getLoginHistory } from "../services/profileService";
import { logout } from "../services/authService";

const RECENT_LIMIT = 5;

export default function Personal() {
  const navigate = useNavigate();
  const columns = [
    { key: "loginTime", label: "Thời gian", align: "center" },
    // { key: "deviceName", label: "Tên thiết bị", align: "left" },
    { key: "status", label: "Trạng thái", align: "center" },
  ];

  const [profile, setProfile] = useState(null);
  const [loginHistory, setLoginHistory] = useState([]);
  const [showChangePasswordForm, setShowChangePasswordForm] = useState(false);

  useEffect(() => {
    // Lấy thông tin cá nhân
    getProfile()
      .then((res) => setProfile(res?.data ?? res))
      .catch((err) => console.error("Lỗi lấy profile:", err));

    // Lấy lịch sử đăng nhập
    getLoginHistory()
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.data ?? []);
        // Format loginTime cho đẹp
        setLoginHistory(
          list.map((item) => ({
            ...item,
            loginTime: item.loginTime
              ? new Date(item.loginTime).toLocaleString("vi-VN")
              : "—",
            // Table component nhận "success" / "failed" (lowercase)
            status:
              item.status?.toLowerCase() === "success" ? "success" : "failed",
          })),
        );
      })
      .catch((err) => console.error("Lỗi lấy lịch sử đăng nhập:", err));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Chỉ hiển thị 5 phiên đăng nhập gần nhất
  const recentHistory = loginHistory.slice(0, RECENT_LIMIT);

  return (
    <div
      style={{ padding: "30px" }}
      className="relative w-full h-9/10 flex flex-col min-h-0 gap-5"
    >
      {/* Card thông tin cá nhân — Profile card */}
      <div className="bg-white rounded-2xl shadow-xl flex items-center justify-between gap-10 px-10 py-6 flex-shrink-0 w-2/3 mx-auto">
        <div className="flex items-center gap-5">
          <img src={avatar} alt="Avatar" />
          <div className="flex flex-col gap-2">
            <p className="font-bold text-3xl">
              {profile?.fullname ?? "Đang tải..."}
            </p>
            <div className="flex items-center justify-center gap-5 text-white border border-black w-42 bg-[#274681] px-2 py-1 rounded-2xl">
              <MailIcon />
              <p className="text-white font-bold text-sm h-10 flex items-center">
                {profile?.role ?? "Nhân viên y tế"}
              </p>
            </div>
            <div className="flex items-center font-medium gap-3 text-sm">
              <img src={avatarsmall} alt="Avatar Small" className="h-10" />
              <label>
                <p className="text-black">
                  Tên đăng nhập: {profile?.username ?? "—"}
                </p>
                <p className="text-black">Email: {profile?.email ?? "—"}</p>
              </label>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-5">
          <Button
            className="w-40 h-10 flex items-center justify-center bg-white border border-[#E90012] text-[#E90012] font-bold gap-3 hover:bg-[#F5F5F5] transition"
            onClick={handleLogout}
          >
            <Logout />
            Đăng xuất
          </Button>
          <Button
            className="w-40 h-10 flex items-center justify-center  bg-[linear-gradient(90deg,#3AD37E_34.13%,#1E6D41_98.56%)] text-white font-bold hover:opacity-80 transition"
            onClick={() => setShowChangePasswordForm(true)}
          >
            <ChangePass />
            Đổi mật khẩu
          </Button>
        </div>
      </div>

      {/* Card lịch sử đăng nhập — Login history card */}
      <div className="bg-white flex-1 min-h-0 rounded-2xl shadow-xl flex flex-col w-2/3 overflow-y-auto mx-auto">
        <h1 className="text-black text-center font-bold text-2xl pt-5 pb-3 flex-shrink-0">
          LỊCH SỬ ĐĂNG NHẬP
        </h1>

        <div className="border-t border-gray-100 flex-shrink-0" />

        <div className="flex-1 p-5 min-h-0 max-w-6xl mx-auto">
          <div className="h-full overflow-y-auto rounded-xl border border-gray-200 bg-[#FAFAFA] p-4">
            {loginHistory.length === 0 ? (
              <p className="text-center text-gray-400 text-sm pt-5">
                Chưa có lịch sử đăng nhập.
              </p>
            ) : (
              <Table columns={columns} data={recentHistory} type="personal" />
            )}
          </div>
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="pointer-events-auto">
          <FormChangePass
            isVisible={showChangePasswordForm}
            onClose={() => setShowChangePasswordForm(false)}
            showCurrentPassword={true}
          />
        </div>
      </div>
    </div>
  );
}
