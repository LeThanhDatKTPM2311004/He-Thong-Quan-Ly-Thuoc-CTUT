/**
 * prescriptionService.js
 */

import { api } from "../lib/apiClient";

/**
 * Lấy danh sách đơn thuốc có phân trang + search
 * GET /api/v1/prescriptions
 */
export const getPrescriptions = (params = {}) => {
  const query = new URLSearchParams();
  query.append("page", params.page ?? 0);
  query.append("size", params.size ?? 10);
  query.append("sortBy", params.sortBy ?? "createdAt");
  query.append("sortDir", params.sortDir ?? "desc");
  if (params.keyword) query.append("keyword", params.keyword);
  if (params.status) query.append("status", params.status);
  return api.get(`/prescriptions?${query.toString()}`);
};

/**
 * Lấy chi tiết đơn thuốc theo prescriptionCode
 * GET /api/v1/prescriptions/:prescriptionCode
 */
export const getPrescriptionByCode = (prescriptionCode) =>
  api.get(`/prescriptions/${prescriptionCode}`);

/**
 * Tạo đơn thuốc mới
 * POST /api/v1/prescriptions
 * @param {{ studentCode, diagnosis, note, details: [{medicineId, quantity}] }} payload
 */
export const createPrescription = (payload) =>
  api.post("/prescriptions", payload);

/**
 * Cập nhật đơn thuốc
 * PUT /api/v1/prescriptions/:prescriptionCode
 * @param {{ studentCode, diagnosis, note, details: [{medicineId, quantity}] }} payload
 */
export const updatePrescription = (prescriptionCode, payload) =>
  api.put(`/prescriptions/${prescriptionCode}`, payload);

/**
 * Xóa đơn thuốc
 * DELETE /api/v1/prescriptions/:prescriptionCode
 */
export const deletePrescription = (prescriptionCode) =>
  api.delete(`/prescriptions/${prescriptionCode}`);

/**
 * Cấp thuốc
 * PATCH /api/v1/prescriptions/:prescriptionCode/dispense
 */
export const dispensePrescription = (prescriptionCode) =>
  api.patch(`/prescriptions/${prescriptionCode}/dispense`);

/**
 * Hoàn thuốc
 * PATCH /api/v1/prescriptions/:prescriptionCode/return
 */
export const returnPrescription = (prescriptionCode) =>
  api.patch(`/prescriptions/${prescriptionCode}/return`);
