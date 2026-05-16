import { api } from "../lib/apiClient";

export const getAccounts = (params = {}) => {
  const query = new URLSearchParams();
  query.append("page", params.page ?? 0);
  query.append("size", params.size ?? 10);
  query.append("sortDir", params.sortDir ?? "desc");
  if (params.keyword) query.append("keyword", params.keyword);

  return api.get(`/accounts?${query.toString()}`);
};
