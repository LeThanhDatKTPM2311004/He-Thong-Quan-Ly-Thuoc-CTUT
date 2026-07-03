import BackIcon from "../assets/svg/BackIcon.jsx";
import lock from "../assets/images/lock.png";
import Title from "./Title.jsx";
import Button from "./Button.jsx";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { changePassword as changeMyPassword } from "../services/profileService";
import { changePassword as changeAccountPassword } from "../services/listAccountService.js";

export default function FormChangePass({
  isVisible = false,
  onClose,
  showCurrentPassword = true,
  accountId, // truyền vào → admin đổi pass người khác (accountService)
  // không truyền → đổi pass chính mình (profileService)
}) {
  const [show_pass, setShow] = useState(false);
  const [show_newpass, setShowNewPass] = useState(false);
  const [show_confirmnewpass, setShowConfirmNewPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (showCurrentPassword && !form.currentPassword) {
      setError("Vui lòng nhập mật khẩu hiện tại.");
      return;
    }
    if (!form.newPassword) {
      setError("Vui lòng nhập mật khẩu mới.");
      return;
    }
    if (!form.confirmPassword) {
      setError("Vui lòng xác nhận mật khẩu mới.");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError("Mật khẩu mới và xác nhận không khớp.");
      return;
    }

    setLoading(true);
    try {
      if (accountId) {
        // Admin đổi pass người khác: PUT /accounts/:id/change-password
        await changeAccountPassword(accountId, {
          oldPassword: "",
          newPassword: form.newPassword,
          confirmPassword: form.confirmPassword,
        });
      } else {
        // Tự đổi pass: PUT /profile/change-password
        await changeMyPassword({
          oldPassword: form.currentPassword,
          newPassword: form.newPassword,
          confirmPassword: form.confirmPassword,
        });
      }

      setSuccess("Đổi mật khẩu thành công!");
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });

      setTimeout(() => {
        setSuccess("");
        onClose?.();
      }, 1500);
    } catch (err) {
      setError(err.message || "Đổi mật khẩu thất bại.");
    } finally {
      setLoading(false);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <div className="bg-black/30 flex items-center justify-center z-50 rounded-2xl shadow-2xl">
        <div className="w-[520px] h-[620px] bg-gradient-to-b from-[#284781] to-white rounded-2xl shadow-2xl relative">
          <div className="flex flex-col px-5 py-2 justify-center text-white text-xs">
            <div onClick={onClose} className="cursor-pointer">
              <BackIcon />
              <p>Trở về</p>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="flex items-center mx-auto justify-center gap-5 bg-white w-20 h-20 rounded-full">
              <img src={lock} alt="Lock Icon" className="w-12 h-12 m-auto" />
            </div>
            <Title
              title="Đổi mật khẩu"
              titleClass="text-xl font-bold text-white"
              subtitle="Điền thông tin dưới đây để tạo mật khẩu mới"
              subtitleClass="text-white text-xs italic"
              wrapperClass="flex flex-col items-center justify-center"
            />
          </div>
          <form
            onSubmit={handleSubmit}
            className="w-1/2 flex flex-col items-center justify-center m-auto mt-5 gap-4 text-xs"
          >
            {showCurrentPassword && (
              <div className="relative w-full">
                <input
                  type={show_pass ? "text" : "password"}
                  name="currentPassword"
                  value={form.currentPassword}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full p-3 outline-none cursor-pointer rounded-sm bg-white focus:ring-1 focus:ring-blue-500"
                  placeholder="Mật khẩu hiện tại"
                />
                <button
                  type="button"
                  onClick={() => setShow(!show_pass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition"
                >
                  {show_pass ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            )}
            <div className="relative w-full">
              <input
                type={show_newpass ? "text" : "password"}
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                disabled={loading}
                className="w-full h-10 p-3 outline-none cursor-pointer rounded-sm bg-white focus:ring-1 focus:ring-blue-500 mt-2"
                placeholder="Mật khẩu mới"
              />
              <button
                type="button"
                onClick={() => setShowNewPass(!show_newpass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition"
              >
                {show_newpass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="relative w-full">
              <input
                type={show_confirmnewpass ? "text" : "password"}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                disabled={loading}
                className="w-full h-10 p-3 outline-none cursor-pointer rounded-sm bg-white focus:ring-1 focus:ring-blue-500 mt-2"
                placeholder="Xác nhận mật khẩu mới"
              />
              <button
                type="button"
                onClick={() => setShowConfirmNewPass(!show_confirmnewpass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition"
              >
                {show_confirmnewpass ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {error && (
              <p className="text-red-500 text-xs text-center w-full">{error}</p>
            )}
            {success && (
              <p className="text-green-500 text-xs text-center w-full">
                {success}
              </p>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="bg-[#264580] w-full cursor-pointer font-bold text-white h-10 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                "Hoàn tất"
              )}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
