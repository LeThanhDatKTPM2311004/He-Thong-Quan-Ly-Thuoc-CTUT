/**
 * ProtectedRoute.jsx
 * - Chưa đăng nhập → redirect /login
 * - Không đủ role  → redirect /personal (trang mặc định cho STAFF)
 */

import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { tokenStorage } from "../lib/tokenStorage";

export default function ProtectedRoute({ children, allowedRoles }) {
  const [status, setStatus] = useState("loading"); // "loading" | "ok" | "unauthorized" | "unauthenticated"

  useEffect(() => {
    const check = async () => {
      const token = await tokenStorage.getAccessToken();
      if (!token) {
        setStatus("unauthenticated");
        return;
      }
      // Nếu không có yêu cầu role cụ thể → cho qua
      if (!allowedRoles || allowedRoles.length === 0) {
        setStatus("ok");
        return;
      }
      const account = await tokenStorage.getAccount();
      const role = account?.role ?? "";
      if (allowedRoles.includes(role)) {
        setStatus("ok");
      } else {
        setStatus("unauthorized");
      }
    };
    check();
  }, []);

  if (status === "loading") return null;
  if (status === "unauthenticated") return <Navigate to="/login" replace />;
  if (status === "unauthorized") return <Navigate to="/personal" replace />;
  return children;
}
