import Button from "./Button";
import { useState, useEffect } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { createAccount, updateAccount } from "../services/listAccountService";
import { useNavigate } from "react-router-dom";

/**
 * FormAccount dùng chung cho Create và Update
 * - Create: <FormAccount title="THÊM TÀI KHOẢN" />
 * - Update: <FormAccount title="CẬP NHẬT TÀI KHOẢN" initialData={{ id, fullname, username, email, role }} />
 */
export default function FormAccount({ title, initialData }) {
  const navigate = useNavigate();
  const isUpdate = !!initialData?.id;

  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    role: "",
  });

  // Đổ dữ liệu cũ vào form khi update
  useEffect(() => {
    if (initialData) {
      setForm({
        fullname: initialData.fullname ?? "",
        username: initialData.username ?? "",
        email: initialData.email ?? "",
        password: "",
        role: initialData.role ?? "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fullname || !form.username || !form.email || !form.role) {
      setError("Vui lòng điền đầy đủ thông tin.");
      return;
    }
    if (!isUpdate && !form.password) {
      setError("Vui lòng nhập mật khẩu.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      if (isUpdate) {
        await updateAccount(initialData.id, {
          fullname: form.fullname,
          username: form.username,
          email: form.email,
          role: form.role,
        });
      } else {
        await createAccount({
          fullname: form.fullname,
          username: form.username,
          email: form.email,
          password: form.password,
          role: form.role,
        });
      }
      navigate("/account");
    } catch (err) {
      setError(err.message || "Thao tác thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-1/2 bg-white h-3/5 rounded-2xl shadow-xl left-145 flex flex-col items-center justify-center absolute top-20">
      <h2 className="text-center text-xl font-bold">{title}</h2>
      <form
        onSubmit={handleSubmit}
        className="flex w-2/3 px-8 flex-col gap-3 items-center justify-center mt-5 font-bold text-white text-sm"
      >
        {/* Tên người dùng */}
        <label className="flex w-full items-center gap-2 border border-[#264580] hover:ring-2 hover:ring-blue-500">
          <span className="bg-[#264580] p-2">Tên người dùng:</span>
          <input
            type="text"
            name="fullname"
            value={form.fullname}
            onChange={handleChange}
            disabled={loading}
            className="py-1 outline-none text-black flex-1 cursor-pointer"
          />
        </label>

        {/* Tên đăng nhập */}
        <label className="flex w-full items-center gap-2 border border-[#264580] hover:ring-2 hover:ring-blue-500">
          <span className="bg-[#264580] p-2">Tên đăng nhập:</span>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            disabled={loading}
            className="py-1 outline-none text-black flex-1 cursor-pointer"
          />
        </label>

        {/* Email */}
        <label className="flex w-full items-center gap-2 border border-[#264580] hover:ring-2 hover:ring-blue-500">
          <span className="bg-[#264580] p-2">Email:</span>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            disabled={loading}
            className="py-1 outline-none text-black flex-1 cursor-pointer"
          />
        </label>

        {/* Mật khẩu — chỉ hiện khi Create */}
        {!isUpdate && (
          <label className="flex w-full items-center gap-2 border border-[#264580] hover:ring-2 hover:ring-blue-500 relative">
            <span className="bg-[#264580] p-2">Mật khẩu:</span>
            <input
              type={show ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              disabled={loading}
              className="py-1 outline-none text-black flex-1 cursor-pointer"
            />
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black transition"
            >
              {show ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </label>
        )}

        {/* Vai trò */}
        <span className="flex w-full items-center gap-2 border justify-between gap-5">
          <span className="bg-[#264580] py-2 px-4.5">Vai trò:</span>
          <label
            htmlFor="user"
            className="text-black cursor-pointer flex items-center justify-center gap-2"
          >
            <input
              id="user"
              type="radio"
              name="role"
              value="STAFF"
              checked={form.role === "STAFF"}
              onChange={handleChange}
              disabled={loading}
            />
            Nhân viên y tế (NVYT)
          </label>
          <label
            htmlFor="admin"
            className="text-black cursor-pointer flex items-center justify-center gap-2"
          >
            <input
              id="admin"
              type="radio"
              name="role"
              value="ADMIN"
              checked={form.role === "ADMIN"}
              onChange={handleChange}
              disabled={loading}
            />
            Quản trị viên (QTV)
          </label>
        </span>

        {/* Lỗi */}
        {error && (
          <p className="text-red-500 text-sm text-center w-full">{error}</p>
        )}

        {/* Nút */}
        <span className="flex items-center justify-center gap-10 p-5">
          <Button
            type="button"
            onClick={() => navigate("/account")}
            disabled={loading}
            className="bg-[#951010] hover:bg-red-600 w-30 h-10"
          >
            HỦY BỎ
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-[#268037] hover:bg-green-600 w-30 h-10 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Đang lưu...
              </>
            ) : (
              "HOÀN TẤT"
            )}
          </Button>
        </span>
      </form>
    </div>
  );
}
