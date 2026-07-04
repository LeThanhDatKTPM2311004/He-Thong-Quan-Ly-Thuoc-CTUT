import { useState } from "react";
import Button from "./Button";

export default function FillTime({
  label = "Truy xuất theo khoảng thời gian từ:",
  button = "Tiến hành truy xuất",
  defaultFrom = "",
  defaultTo = "",
  onChange,
  loading = false,
}) {
  const [from, setFrom] = useState(defaultFrom);
  const [to, setTo] = useState(defaultTo);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onChange) onChange({ from, to });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center justify-center gap-6 py-5 font-bold text-xl"
    >
      <label htmlFor="fortime" className="cursor-pointer">
        {label}{" "}
      </label>
      <input
        id="fortime"
        type="date"
        value={from}
        onChange={(e) => setFrom(e.target.value)}
        className="outline-none bg-white w-30 h-8 rounded-2xl shadow-sm p-2 text-black text-xs cursor-pointer"
      />
      <label htmlFor="totime" className="cursor-pointer">
        đến:{" "}
      </label>
      <input
        id="totime"
        type="date"
        value={to}
        onChange={(e) => setTo(e.target.value)}
        className="outline-none bg-white w-30 h-8 rounded-2xl shadow-sm p-2 text-black text-xs cursor-pointer"
      />
      <Button
        type="submit"
        disabled={loading}
        className="bg-[#39B90F] text-xl text-white w-60 h-10 flex items-center justify-center gap-2 rounded-2xl shadow-sm hover:shadow-md transition-all duration-200"
      >
        {loading ? "Đang truy xuất..." : button}
      </Button>
    </form>
  );
}
