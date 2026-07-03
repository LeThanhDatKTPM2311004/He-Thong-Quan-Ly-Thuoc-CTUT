import CheckIcon from "../assets/svg/CheckIcon";
import { useNavigate } from "react-router-dom";
export default function FormNotification({
  type,
  message = "Chào mừng bạn đã đến với hệ thống",
  source = "hệ thống",
  dateTime = "11:00 23/05/2025",
  typeText = "Đăng nhập thành công !",
  batchId,
}) {
  const navigate = useNavigate();

  const handleViewDetail = () => {
    navigate("/medicine", {
      state: {
        searchBatch: batchId,
        _t: Date.now(), // ← thêm dòng này
      },
    });
  };
  const typeConfig = {
    success: {
      icon: <CheckIcon />,
      text: typeText,
      background: "bg-[#22BB55]",
      color: "text-[#22BB55]",
    },
    pending: {
      icon: "!",
      text: typeText,
      background: "bg-[#EE7700]",
      color: "text-[#EE7700]",
    },
    warning: {
      icon: "!",
      text: typeText,
      background: "bg-[#EE4444]",
      color: "text-[#EE4444]",
    },
    refusal: {
      icon: "X",
      text: typeText,
      background: "bg-[#EE4444]",
      color: "text-[#EE4444]",
    },
  };
  if (type === "success") {
    return (
      <div className="w-full bg-white h-30 rounded-lg border-1 my-5">
        <div
          className={`w-full h-full flex justify-center px-10 gap-5 flex-col ${typeConfig[type]?.color}`}
        >
          <div className="flex items-center gap-5">
            <div
              className={`w-8 h-8 rounded-full ${typeConfig[type]?.background} flex items-center justify-center text-white`}
            >
              {typeConfig[type]?.icon}
            </div>
            <span className="text-base font-bold">
              {typeConfig[type]?.text}
            </span>
          </div>
          <p className="text-[#666666] italic font-medium text-xs">
            {message} - từ {source} lúc {dateTime}
          </p>
        </div>
      </div>
    );
  }
  if (type === "pending") {
    return (
      <div className="w-full bg-white h-30 rounded-lg border-1 my-5">
        <div
          className={`w-full h-full flex justify-center px-10 gap-5 flex-col ${typeConfig[type]?.color}`}
        >
          <div className="flex items-center gap-5">
            <div
              className={`w-8 h-8 rounded-full ${typeConfig[type]?.background} flex items-center justify-center text-white`}
            >
              {typeConfig[type]?.icon}
            </div>
            <span className="text-base font-bold">
              {typeConfig[type]?.text}
            </span>
          </div>
          <p className="text-[#666666] italic font-medium text-xs">
            {message} - từ {source} lúc {dateTime}
          </p>
        </div>
      </div>
    );
  }
  if (type === "warning") {
    return (
      <div className="w-full bg-white h-30 rounded-lg border-1 my-5">
        <div
          className={`w-full h-full flex justify-center px-10 gap-5 flex-col ${typeConfig[type]?.color}`}
        >
          <div className="flex items-center gap-5">
            <div
              className={`w-8 h-8 rounded-full ${typeConfig[type]?.background} flex items-center justify-center text-white`}
            >
              {typeConfig[type]?.icon}
            </div>
            <span className="text-base font-bold">
              {typeConfig[type]?.text}
            </span>
          </div>
          <div className="flex items-center justify-between gap-10 text-xs">
            <p className="text-[#666666] italic font-medium">
              {message} - từ {source} lúc {dateTime}
            </p>
            <p
              onClick={handleViewDetail}
              className="text-blue-500 underline cursor-pointer font-bold"
            >
              Xem chi tiết
            </p>
          </div>
        </div>
      </div>
    );
  }
  if (type === "refusal") {
    return (
      <div className="w-full bg-white h-30 rounded-lg border-1 my-5">
        <div
          className={`w-full h-full flex justify-center px-10 gap-5 flex-col ${typeConfig[type]?.color}`}
        >
          <div className="flex items-center gap-5">
            <div
              className={`w-8 h-8 rounded-full ${typeConfig[type]?.background} flex items-center justify-center text-white`}
            >
              {typeConfig[type]?.icon}
            </div>
            <span className="text-base font-bold">
              {typeConfig[type]?.text}
            </span>
          </div>
          <p className="text-[#666666] italic font-medium">
            {message} - từ {source} lúc {dateTime}
          </p>
        </div>
      </div>
    );
  }
}
