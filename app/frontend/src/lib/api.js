/**
 * api.js — Axios instance with JWT auth + auto-refresh.
 * Uses Capacitor Preferences when running as APK (global window.Capacitor exists),
 * otherwise falls back to localStorage for browser / dev mode.
 * No static import of @capacitor/preferences — it is accessed via the global
 * that Capacitor injects at runtime inside the WebView.
 */
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
export const API_BASE = `${BACKEND_URL}/api`;

// ── Storage abstraction ──────────────────────────────────────────────────────
// Inside the APK, Capacitor registers plugins on `window.Capacitor.Plugins`.
// In a regular browser there is no such global → we use localStorage.

function _cap() {
  try { return window?.Capacitor?.Plugins?.Preferences ?? null; } catch { return null; }
}

export async function storageGet(key) {
  const p = _cap();
  if (p) { const { value } = await p.get({ key }); return value; }
  return localStorage.getItem(key);
}

export async function storageSet(key, value) {
  const p = _cap();
  if (p) { await p.set({ key, value: String(value) }); }
  else { localStorage.setItem(key, value); }
}

export async function storageRemove(key) {
  const p = _cap();
  if (p) { await p.remove({ key }); }
  else { localStorage.removeItem(key); }
}

// Sync versions for axios interceptors (which cannot be async)
function storageGetSync(key) {
  try { return localStorage.getItem(key); } catch { return null; }
}
function storageSetSync(key, value) {
  try { localStorage.setItem(key, value); } catch {}
}
function storageRemoveSync(key) {
  try { localStorage.removeItem(key); } catch {}
}

// ── Axios instance ───────────────────────────────────────────────────────────
export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const tok = storageGetSync("wms.accessToken");
  if (tok) config.headers.Authorization = `Bearer ${tok}`;
  if (config.method === "post") {
    config.headers["Idempotency-Key"] =
      (typeof crypto !== "undefined" && crypto.randomUUID)
        ? crypto.randomUUID()
        : String(Date.now()) + Math.random().toString(16).slice(2);
  }
  return config;
});

let refreshing = null;
api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const original = err.config || {};
    if (err.response?.status === 401 && !original.__retried) {
      original.__retried = true;
      const rt = storageGetSync("wms.refreshToken");
      if (!rt) {
        storageRemoveSync("wms.accessToken");
        window.location.replace("/#/login");
        return Promise.reject(err);
      }
      try {
        refreshing = refreshing || axios.post(`${API_BASE}/auth/refresh`, { refreshToken: rt });
        const { data } = await refreshing;
        refreshing = null;
        storageSetSync("wms.accessToken", data.accessToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api.request(original);
      } catch (e) {
        refreshing = null;
        storageRemoveSync("wms.accessToken");
        storageRemoveSync("wms.refreshToken");
        window.location.replace("/#/login");
        return Promise.reject(e);
      }
    }
    return Promise.reject(err);
  }
);
