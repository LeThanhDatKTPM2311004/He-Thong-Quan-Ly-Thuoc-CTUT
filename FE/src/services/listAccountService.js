/**
 * accountService.js
 */

import { api } from "../lib/apiClient";

/** Lấy danh sách tài khoản có phân trang + search */
export const getAccounts = (params = {}) => {
  const query = new URLSearchParams();
  query.append("page", params.page ?? 0);
  query.append("size", params.size ?? 10);
  query.append("sortDir", params.sortDir ?? "desc");
  if (params.keyword) query.append("keyword", params.keyword);
  return api.get(`/accounts?${query.toString()}`);
};

/** Lấy thông tin 1 tài khoản theo id */
export const getAccountById = (id) => api.get(`/accounts/${id}`);

/** Tạo tài khoản mới */
export const createAccount = (payload) => api.post("/accounts", payload);

/** Cập nhật tài khoản */
export const updateAccount = (id, payload) =>
  api.put(`/accounts/${id}`, payload);

/** Khóa tài khoản */
export const lockAccount = (id) => api.patch(`/accounts/${id}/lock`);

/** Mở khóa tài khoản */
export const unlockAccount = (id) => api.patch(`/accounts/${id}/unlock`);

/**
 * Đổi mật khẩu
 * PUT /accounts/:id/change-password
 * @param {number} id
 * @param {{ newPassword, confirmPassword }} payload
 */
export const changePassword = (id, payload) =>
  api.put(`/accounts/${id}/change-password`, payload);
