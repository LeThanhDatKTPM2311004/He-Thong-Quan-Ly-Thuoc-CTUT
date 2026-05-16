import avatar from "../assets/images/avatar.png";
import avatarsmall from "../assets/images/avatarsmall.png";
import MailIcon from "../assets/svg/MailIcon.jsx";
import ChangePass from "../assets/svg/ChangePass.jsx";
import Button from "../components/Button.jsx";
import Logout from "../assets/svg/LogoutIcon.jsx";
import Table from "../components/Table/Table.jsx";
import FormChangePass from "../components/FormChangePass.jsx";
import { useState, useEffect } from "react";
import { getProfile, getLoginHistory } from "../services/profileService";

export default function Personal() {
  const columns = [
    { key: "loginTime", label: "Thời gian", align: "left" },
    // { key: "deviceName", label: "Tên thiết bị", align: "left" },
    { key: "status", label: "Trạng thái", align: "left" },
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

  return (
    <div className="w-3/4 bg-white absolute top-20 left-105 h-5/6 rounded-2xl shadow-xl">
      <div className="w-5/6 bg-white absolute left-25 top-2 h-45 rounded-2xl shadow-xl flex items-center justify-between gap-10 p-10">
        <div className="flex items-center justify-center gap-5">
          <img src={avatar} alt="Avatar" />
          <div className="flex flex-col justify-center gap-2">
            <p className="font-bold text-3xl">
              {profile?.fullname ?? "Đang tải..."}
            </p>
            <div className="flex items-center justify-center gap-3 text-white border border-1 border-black w-42 bg-[#274681] px-2 py-1 rounded-2xl">
              <MailIcon />
              <p className="text-white font-bold text-sm">
                {profile?.role ?? "Nhân viên y tế"}
              </p>
            </div>
            <div className="flex items-center justify-center text-[10px] mr-15">
              <img src={avatarsmall} alt="Avatar Small" />
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
            className="w-30 h-8 flex items-center justify-center text-[9px] bg-white border border-1 border-[#E90012] text-[#E90012] font-bold gap-3 hover:bg-[#F5F5F5] transition"
            onClick={() => {
              // Logic đăng xuất
            }}
          >
            <Logout />
            Đăng xuất
          </Button>
          <Button
            className="w-30 h-8 flex items-center justify-center text-[9px] bg-[linear-gradient(90deg,#3AD37E_34.13%,#1E6D41_98.56%)] text-white font-bold gap-0=3 hover:opacity-80 transition"
            onClick={() => setShowChangePasswordForm(true)}
          >
            <ChangePass />
            Đổi mật khẩu
          </Button>
        </div>
      </div>

      <div className="w-5/6 bg-white absolute left-25 bottom-2 h-3/5 rounded-2xl shadow-xl">
        <h1 className="text-black text-center font-bold text-2xl pt-5 pb-1">
          LỊCH SỬ ĐĂNG NHẬP
        </h1>
        <div className="overflow-y-auto max-h-[400px] p-5">
          {loginHistory.length === 0 ? (
            <p className="text-center text-gray-400 text-sm pt-5">
              Chưa có lịch sử đăng nhập.
            </p>
          ) : (
            <Table columns={columns} data={loginHistory} type="personal" />
          )}
        </div>
      </div>

      <FormChangePass
        isVisible={showChangePasswordForm}
        onClose={() => setShowChangePasswordForm(false)}
        showCurrentPassword={true}
      />
    </div>
  );
}
