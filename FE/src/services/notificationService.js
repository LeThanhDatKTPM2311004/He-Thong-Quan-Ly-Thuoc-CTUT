import { api } from "../lib/apiClient";

export const getNotifications = () => {
  return api.get("/notifications");
};
