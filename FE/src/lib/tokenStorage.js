/**
 * tokenStorage.js
 * Hiện tại: localStorage (chạy web / Vite dev)
 *
 * Khi tích hợp Tauri sau này, chỉ cần sửa file này duy nhất:
 *   - Cài: npm install @tauri-apps/plugin-store
 *   - Uncomment phần tauriDriver bên dưới
 *   - Sửa getDriver() trả về tauriDriver khi isTauri() === true
 *   → Toàn bộ code còn lại (authService, apiClient) KHÔNG cần đụng vào
 */

const KEYS = {
  ACCESS_TOKEN: "auth.accessToken",
  REFRESH_TOKEN: "auth.refreshToken",
  ACCOUNT: "auth.account",
};

// ─────────────────────────────────────────────
// Driver: localStorage
// ─────────────────────────────────────────────
const localStorageDriver = {
  async set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  async get(key) {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  },
  async remove(key) {
    localStorage.removeItem(key);
  },
  async clear() {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  },
};

// ─────────────────────────────────────────────
// TODO (khi tích hợp Tauri):
// import { Store } from "@tauri-apps/plugin-store";
//
// const tauriDriver = {
//   async set(key, value) { ... },
//   async get(key) { ... },
//   async clear() { ... },
// };
//
// const isTauri = () => typeof window !== "undefined" && !!window.__TAURI__;
// const getDriver = () => (isTauri() ? tauriDriver : localStorageDriver);
// ─────────────────────────────────────────────

const getDriver = () => localStorageDriver;

// ─────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────
export const tokenStorage = {
  async save({ accessToken, refreshToken, account }) {
    const driver = getDriver();
    await Promise.all([
      driver.set(KEYS.ACCESS_TOKEN, accessToken),
      driver.set(KEYS.REFRESH_TOKEN, refreshToken),
      driver.set(KEYS.ACCOUNT, account),
    ]);
  },

  async getAccessToken() {
    return getDriver().get(KEYS.ACCESS_TOKEN);
  },

  async getRefreshToken() {
    return getDriver().get(KEYS.REFRESH_TOKEN);
  },

  async getAccount() {
    return getDriver().get(KEYS.ACCOUNT);
  },

  async clear() {
    return getDriver().clear();
  },
};
