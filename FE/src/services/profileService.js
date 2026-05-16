import { api } from "../lib/apiClient";

/**
 * Lấy thông tin cá nhân của account đang đăng nhập
 * GET /api/v1/profile
 */
export const getProfile = () => api.get("/profile");

/**
 * Đổi mật khẩu
 * PUT /api/v1/profile/change-password
 * @param {{ oldPassword: string, newPassword: string, confirmPassword: string }} payload
 */
export const changePassword = (payload) =>
  api.put("/profile/change-password", payload);

/**
 * Lấy lịch sử đăng nhập
 * GET /api/v1/profile/login-history
 */
export const getLoginHistory = () => api.get("/profile/login-history");
