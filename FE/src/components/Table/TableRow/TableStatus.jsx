import CheckIcon from "../../../assets/svg/CheckIcon";
import CancelIcon from "../../../assets/svg/CancelIcon";
export default function TableStatus({ status }) {
  const statusConfig = {
    active: {
      text: "text-[#49C10C]",
      label: "Đang sử dụng",
    },
    inactive: {
      text: "text-[#B11010]",
      label: "Đã khóa",
    },
    success: {
      background: "bg-[linear-gradient(90deg,#3AD37E_34.13%,#1E6D41_98.56%)]",
      label: "Đã Thành Công",
    },
    failed: {
      background: "bg-[linear-gradient(90deg,#34C759_27%,#1E5128_98.56%)]",
      label: "Đã Thất Bại",
    },
    exp: {
      text: "text-[#B11010]",
      label: "Xuất",
    },
    imp: {
      text: "text-[#49C10C]",
      label: "Nhập",
    },
    waiting: {
      label: "Chờ thuốc",
      color: "text-[#10718E]",
    },
    completed: {
      label: "Đã hoàn thuốc",
      color: "text-[#8E1010]",
    },
    dispensed: {
      label: "Đã cấp thuốc",
      color: "text-[#3D8E10]",
    },
  };

  const config = statusConfig[status] || statusConfig.inactive;

  return (
    <>
      {(status === "active" || status === "inactive") && (
        <span className={`py-1 text-xs font-bold ${config.text} `}>
          {config.label}
        </span>
      )}
      {(status === "imp" || status === "exp") && (
        <span className={`py-1 text-xs font-bold ${config.text} `}>
          {config.label}
        </span>
      )}
      {(status === "waiting" ||
        status === "completed" ||
        status === "dispensed") && (
        <span className={`py-1 text-xs font-bold ${config.color} `}>
          {config.label}
        </span>
      )}
      {status === "success" && (
        <div className="w-35 h-8 flex items-center justify-center gap-2 py-2 rounded-full shadow-2xl bg-[linear-gradient(90deg,#3AD37E_34.13%,#1E6D41_98.56%)] text-white font-bold text-xs">
          <span className="w-6 h-6 flex items-center justify-center bg-green-700 shadow-[2px_3px_10px_rgba(0,0,0,0.9)] rounded-full p-1">
            <CheckIcon />
          </span>
          <p>Thành Công</p>
        </div>
      )}
      {status === "failed" && (
        <div className="w-35 h-8  flex items-center justify-center gap-2 pr-5 py-2 rounded-full shadow-2xl bg-[linear-gradient(90deg,#FF5252_34.13%,#B11010_98.56%)] text-white font-bold text-xs">
          <span className="w-6 h-6 flex items-center justify-center bg-red-700 shadow-[2px_3px_10px_rgba(0,0,0,0.9)] rounded-full p-1">
            <CancelIcon />
          </span>
          <p>Thất Bại</p>
        </div>
      )}
    </>
  );
}
