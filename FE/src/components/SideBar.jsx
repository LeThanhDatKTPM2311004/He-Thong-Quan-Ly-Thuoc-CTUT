import AccountIcon from "../assets/svg/AccountIcon.jsx";
import PersonInfoIcon from "../assets/svg/PersonInfoIcon.jsx";
import StudentInfomation from "../assets/svg/StudentInfomation.jsx";
import MedicineIcon from "../assets/svg/MedicineIcon.jsx";
import OrderIcon from "../assets/svg/OrderIcon.jsx";
import NofiIcon from "../assets/svg/NofiIcon.jsx";
import StatIcon from "../assets/svg/StatIcon.jsx";
import Vector from "../assets/svg/Vector.jsx";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { tokenStorage } from "../lib/tokenStorage";

const MENU_ITEMS = [
  {
    icon: AccountIcon,
    label: "Quản lí tài khoản",
    path: "/account",
    roles: ["ADMIN"], // chỉ ADMIN thấy
  },
  {
    icon: PersonInfoIcon,
    label: "Thông tin cá nhân",
    path: "/personal",
    roles: ["ADMIN", "STAFF"],
  },
  {
    icon: StudentInfomation,
    label: "Thông tin sinh viên",
    path: "/student",
    roles: ["ADMIN", "STAFF"],
  },
  {
    icon: MedicineIcon,
    label: "Quản lí thuốc",
    path: "/medicine",
    roles: ["ADMIN", "STAFF"],
  },
  {
    icon: OrderIcon,
    label: "Quản lí đơn thuốc",
    path: "/prescription",
    roles: ["ADMIN", "STAFF"],
  },
  {
    icon: NofiIcon,
    label: "Thông báo",
    path: "/notification",
    roles: ["ADMIN", "STAFF"],
  },
  {
    icon: StatIcon,
    label: "Thống kê",
    path: "/statistics",
    roles: ["ADMIN", "STAFF"],
  },
];

function MenuItem({ icon, label, isActive, onClick }) {
  const IconComponent = icon;
  return (
    <span
      onClick={onClick}
      className={`flex w-3/4 items-center hover:bg-[#264580] p-2 rounded-xl transition hover:text-white cursor-pointer
        ${isActive ? "bg-[#264580] text-white" : ""}`}
    >
      <div className="flex justify-center">
        <IconComponent />
      </div>
      <p className="ml-2 flex-1 text-left">{label}</p>
      <Vector />
    </span>
  );
}

export default function SideBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState("");

  useEffect(() => {
    const getRole = async () => {
      const account = await tokenStorage.getAccount();
      setRole(account?.role ?? "");
    };
    getRole();
  }, []);

  // Lọc menu theo role
  const visibleItems = MENU_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <div className="w-full flex flex-col gap-3 mt-15 text-[#9197B3] items-center justify-center text-xs cursor-pointer">
      {visibleItems.map((item, index) => (
        <MenuItem
          key={index}
          icon={item.icon}
          label={item.label}
          path={item.path}
          isActive={location.pathname.startsWith(item.path)}
          onClick={() => navigate(item.path)}
        />
      ))}
    </div>
  );
}
