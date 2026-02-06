import { apiFetch } from "./api";

export function fetchAnalytics() {
  return apiFetch("/analytics/overview");
}
