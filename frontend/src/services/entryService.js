import { apiFetch } from "./api";

export function fetchEntries(params = {}) {
  const query = new URLSearchParams(params).toString();
  return apiFetch(`/entries${query ? `?${query}` : ""}`);
}

export function createEntry(payload) {
  return apiFetch("/entries", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getSuggestions(payload) {
  return apiFetch("/entries/suggestions", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function uploadImage(file) {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const token = localStorage.getItem("lifelens_token");
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(`${API_URL}/entries/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Upload failed");
  }
  return res.json();
}
