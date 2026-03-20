/**
 * medicineService.js
 */

import { api } from "../lib/apiClient";

/**
 * Lấy danh sách thuốc có phân trang + search
 * GET /api/v1/medicines?page=0&size=10&sortBy=id&sortDir=asc&keyword=...&status=...
 */
export const getMedicines = (params = {}) => {
  const query = new URLSearchParams();
  query.append("page", params.page ?? 0);
  query.append("size", params.size ?? 10);
  query.append("sortBy", params.sortBy ?? "id");
  query.append("sortDir", params.sortDir ?? "asc");
  if (params.keyword) query.append("keyword", params.keyword);
  if (params.status) query.append("status", params.status);
  return api.get(`/medicines?${query.toString()}`);
};
/**
 * Thêm thuốc mới
 * POST /api/v1/medicines
 * @param {{ name, unit, quantity, expiryDate }} payload
 */
export const createMedicine = (payload) => api.post("/medicines", payload);
/**
 * Nhập lô thuốc vào thuốc đã có
 * POST /api/v1/medicines/:medicineId/batches
 * @param {number} medicineId
 * @param {{ quantity, expiryDate }} payload
 */
export const addBatch = (medicineId, payload) =>
  api.post(`/medicines/${medicineId}/batches`, payload);
/** Khóa thuốc */
export const lockMedicine = (medicineId) =>
  api.patch(`/medicines/${medicineId}/lock`);

/** Mở khóa thuốc */
export const unlockMedicine = (medicineId) =>
  api.patch(`/medicines/${medicineId}/unlock`);
/**
 * Lấy thông tin batch theo batchId
 * GET /api/v1/medicines/batches/:batchId
 */
export const getBatchById = (batchId) =>
  api.get(`/medicines/batches/${batchId}`);

/**
 * Cập nhật batch
 * PUT /api/v1/medicines/:medicineId/batches/:batchId
 */
export const updateBatch = (medicineId, batchId, payload) =>
  api.put(`/medicines/${medicineId}/batches/${batchId}`, payload);

/**
 * Xóa batch
 * DELETE /api/v1/medicines/batches/:batchId
 */
export const deleteBatch = (batchId) =>
  api.delete(`/medicines/batches/${batchId}`);
/**
 * Truy xuất lịch sử nhập/xuất thuốc
 * GET /api/v1/medicines/:medicineId/trace?from=...&to=...
 */
export const traceMedicine = (medicineId, params = {}) => {
  const query = new URLSearchParams();
  if (params.from) query.append("from", params.from);
  if (params.to) query.append("to", params.to);
  const qs = query.toString();
  return api.get(`/medicines/${medicineId}/trace${qs ? `?${qs}` : ""}`);
};
/**
 * Helper nội bộ: fetch file blob có auth
 */
const fetchBlob = async (endpoint, params = {}) => {
  const { tokenStorage } = await import("../lib/tokenStorage.js");
  const token = await tokenStorage.getAccessToken();
  const query = new URLSearchParams();
  if (params.from) query.append("from", params.from);
  if (params.to) query.append("to", params.to);
  const qs = query.toString();
  const res = await fetch(`/api/v1${endpoint}${qs ? `?${qs}` : ""}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.blob();
};
/**
 * Xuất báo cáo PDF
 * GET /api/v1/medicines/export/pdf?from=...&to=...
 */
export const exportMedicinePdf = (params = {}) =>
  fetchBlob("/medicines/export/pdf", params);

/**
 * Xuất báo cáo Excel
 * GET /api/v1/medicines/export/excel?from=...&to=...
 */
export const exportMedicineExcel = (params = {}) =>
  fetchBlob("/medicines/export/excel", params);
