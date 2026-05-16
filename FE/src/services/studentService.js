/**
 * studentService.js
 */

import { api } from "../lib/apiClient";

/**
 * Lấy thông tin sinh viên theo mã số
 * GET /api/v1/students/:studentCode
 */
export const getStudentByCode = (studentCode) =>
  api.get(`/students/${studentCode}`);

/**
 * Import danh sách sinh viên từ file Excel
 * POST /api/v1/students/import  (multipart/form-data)
 * @param {File} file
 * @returns {Promise<Array>} danh sách sinh viên đã import
 */
export const importStudents = async (file) => {
  const { tokenStorage } = await import("../lib/tokenStorage.js");
  const token = await tokenStorage.getAccessToken();
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/v1/students/import", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "ngrok-skip-browser-warning": "true",
    },
    body: formData,
  });
  const json = await res.json();
  if (!res.ok || json.status !== "SUCCESS") {
    throw new Error(json.message || `HTTP ${res.status}`);
  }
  return json.data ?? json;
};
// Lấy tất cả sinh viên
export const getAllStudents = () => api.get("/students");
