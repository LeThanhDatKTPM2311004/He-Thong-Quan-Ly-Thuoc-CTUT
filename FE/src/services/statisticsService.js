import { api } from "../lib/apiClient.js";

// GET /api/v1/statistics/overview?month=&year=
export async function getStatisticsOverview({ month, year } = {}) {
  const params = new URLSearchParams();
  if (month) params.append("month", month);
  if (year) params.append("year", year);
  return api.get(`/statistics/overview?${params.toString()}`);
}

// GET /api/v1/statistics/medicine-import-export?from=&to=
export async function getMedicineImportExport({ from, to } = {}) {
  const params = new URLSearchParams();
  if (from) params.append("from", from);
  if (to) params.append("to", to);
  return api.get(`/statistics/medicine-import-export?${params.toString()}`);
}

// GET /api/v1/statistics/expiry-warning
export async function getExpiryWarning() {
  return api.get("/statistics/expiry-warning");
}
