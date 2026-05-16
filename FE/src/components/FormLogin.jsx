import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Button from "./Button";
import { login } from "../services/authService";

export default function FormLogin({ onSuccess }) {
  const [form, setForm] = useState({ usernameOrEmail: "", password: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.usernameOrEmail.trim() || !form.password.trim()) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const data = await login(form.usernameOrEmail.trim(), form.password);
      onSuccess?.(data);
    } catch (err) {
      setError(err.message || "Đăng nhập thất bại, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form
        action=""
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 items-center justify-center w-1/3 text-[#FFF] font-bold"
      >
        <input
          type="text"
          name="usernameOrEmail"
          value={form.usernameOrEmail}
          onChange={handleChange}
          disabled={loading}
          placeholder="Tên đăng nhập"
          className="w-full border border-2 rounded-sm h-10 placeholder-white placeholder-font-medium cursor-pointer outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500 transition focus:placeholder:opacity-0 p-2"
        />
        <div className="w-full relative">
          <input
            type={show ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            disabled={loading}
            placeholder="Mật khẩu"
            className="w-full border border-2 rounded-sm h-10 placeholder-white placeholder-font-medium cursor-pointer outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500 transition focus:placeholder:opacity-0 p-2"
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="
              absolute right-3 top-1/2 -translate-y-1/2
              text-white hover:text-black transition
            "
          >
            {show ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Chỉ render khi có lỗi, không làm thay đổi layout */}
        {error && (
          <p className="w-full text-red-400 text-sm text-center -mt-2">
            {error}
          </p>
        )}

        <Button
          className="w-1/2 h-10 bg-white text-black rounded-lg hover:border hover:border-2 hover:border-blue-600 hover:ring-2 hover:ring-blue-500"
          type="submit"
          disabled={loading}
        >
          {loading ? "Đang đăng nhập..." : "ĐĂNG NHẬP"}
        </Button>
      </form>
    </>
  );
}
