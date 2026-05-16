/**
 * authService.js
 * Các hàm liên quan đến xác thực người dùng.
 * Không cần biết storage ở đâu — tokenStorage tự lo.
 */

import { request, ApiError } from "../lib/apiClient.js";
import { tokenStorage } from "../lib/tokenStorage.js";

// Login

/**
 * Đăng nhập và lưu token vào secure store.
 * @param {string} usernameOrEmail
 * @param {string} password
 * @returns {{ account, accessToken, refreshToken, tokenType, accessExpiresIn }}
 */
export async function login(usernameOrEmail, password) {
  const data = await request(
    "/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ usernameOrEmail, password }),
    },
    false, // không cần auth header khi đăng nhập
  );

  await tokenStorage.save(data);
  return data;
}

// Logout

/**
 * Đăng xuất: gửi cả hai token lên server, sau đó xóa local.
 */
export async function logout() {
  try {
    const [accessToken, refreshToken] = await Promise.all([
      tokenStorage.getAccessToken(),
      tokenStorage.getRefreshToken(),
    ]);

    if (accessToken && refreshToken) {
      await request("/auth/logout", {
        method: "POST",
        body: JSON.stringify({ accessToken, refreshToken }),
      });
    }
  } catch (err) {
    // Kể cả server lỗi vẫn xóa token local
    console.warn("[authService] Logout server error (ignored):", err.message);
  } finally {
    await tokenStorage.clear();
  }
}

// Lấy thông tin user hiện tại từ storage

export async function getCurrentUser() {
  return tokenStorage.getAccount();
}

// Kiểm tra đã đăng nhập chưa

export async function isAuthenticated() {
  const token = await tokenStorage.getAccessToken();
  return token !== null && token !== undefined;
}
