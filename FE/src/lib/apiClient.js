/**
 * apiClient.js
 * HTTP client tái sử dụng với:
 *  - Tự động đính kèm Authorization header
 *  - Tự động refresh accessToken khi hết hạn (401)
 *  - Hàng đợi request trong khi đang refresh (tránh race condition)
 *  - Chỉ cần thay BASE_URL hoặc truyền endpoint khi gọi
 */

import { tokenStorage } from "./tokenStorage.js";

// ─────────────────────────────────────────────
// Cấu hình
// ─────────────────────────────────────────────

const BASE_URL = "/api/v1";

const ENDPOINTS = {
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  REFRESH: "/auth/refresh",
};

// ─────────────────────────────────────────────
// Trạng thái refresh (chống race condition)
// ─────────────────────────────────────────────
let isRefreshing = false;
let refreshQueue = []; // [{ resolve, reject }]

function processQueue(error, newAccessToken) {
  refreshQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve(newAccessToken);
  });
  refreshQueue = [];
}

// ─────────────────────────────────────────────
// Refresh token logic
// ─────────────────────────────────────────────
async function refreshAccessToken() {
  const refreshToken = await tokenStorage.getRefreshToken();
  if (!refreshToken) throw new Error("Không có refresh token");

  const res = await fetch(`${BASE_URL}${ENDPOINTS.REFRESH}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  const json = await res.json();

  if (!res.ok || json.status !== "SUCCESS") {
    throw new Error(json.message || "Refresh token thất bại");
  }

  await tokenStorage.save(json.data);
  return json.data.accessToken;
}

// ─────────────────────────────────────────────
// Core request function
// ─────────────────────────────────────────────
/**
 * Gửi HTTP request có xác thực JWT.
 *
 * @param {string} endpoint    - Path API, ví dụ: "/users" hoặc "/orders/123"
 * @param {RequestInit} options - fetch options (method, body, headers, ...)
 * @param {boolean} withAuth   - Có đính kèm Authorization header không (mặc định true)
 * @returns {Promise<any>}      - Parsed JSON response (field `data`)
 * @throws {ApiError}
 */
export async function request(endpoint, options = {}, withAuth = true) {
  const url = `${BASE_URL}${endpoint}`;

  // Build headers
  const headers = {
    "Content-Type": "application/json",
    "ngrok-skip-browser-warning": "true",
    ...options.headers,
  };

  if (withAuth) {
    const accessToken = await tokenStorage.getAccessToken();
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }
  }

  let res = await fetch(url, { ...options, headers });
  const isAuthEndpoint = endpoint.startsWith("/auth/");
  // ── 401: thử refresh rồi retry ─────────────
  if (res.status === 401 && withAuth && !isAuthEndpoint) {
    if (isRefreshing) {
      // Đã có request khác đang refresh → chờ
      const newToken = await new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      });
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(url, { ...options, headers });
    } else {
      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken();
        processQueue(null, newToken);
        headers["Authorization"] = `Bearer ${newToken}`;
        res = await fetch(url, { ...options, headers });
      } catch (err) {
        processQueue(err, null);
        // Refresh thất bại → clear token, ném lỗi để UI redirect login
        await tokenStorage.clear();
        throw new ApiError(
          "Phiên đăng nhập hết hạn, vui lòng đăng nhập lại",
          401,
        );
      } finally {
        isRefreshing = false;
      }
    }
  }

  // ── Parse JSON ──────────────────────────────
  let json;
  try {
    json = await res.json();
  } catch {
    throw new ApiError(
      `Phản hồi không hợp lệ từ server (${res.status})`,
      res.status,
    );
  }

  if (!res.ok || json.status !== "SUCCESS") {
    throw new ApiError(json.message || `HTTP ${res.status}`, res.status, json);
  }

  return json.data ?? json;
}

// ─────────────────────────────────────────────
// Shorthand helpers
// ─────────────────────────────────────────────
export const api = {
  get: (endpoint, options) => request(endpoint, { method: "GET", ...options }),

  post: (endpoint, body, options) =>
    request(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      ...options,
    }),

  put: (endpoint, body, options) =>
    request(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
      ...options,
    }),

  patch: (endpoint, body, options) =>
    request(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
      ...options,
    }),

  delete: (endpoint, options) =>
    request(endpoint, { method: "DELETE", ...options }),
};

// ─────────────────────────────────────────────
// Custom Error class
// ─────────────────────────────────────────────
export class ApiError extends Error {
  constructor(message, status, raw) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.raw = raw;
  }
}
