import axios from "axios";

const API_BASE = import.meta.env.VITE_API_URL || "/api/v1";
const REFRESH_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/auth/refresh/`
  : "/api/v1/auth/refresh/";

export const TOKENS_KEY = "bm_tokens";

export function getTokens() {
  try {
    return JSON.parse(localStorage.getItem(TOKENS_KEY) || "null");
  } catch {
    return null;
  }
}

export function setTokens(tokens) {
  if (tokens) localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens));
  else localStorage.removeItem(TOKENS_KEY);
}

export function currency(amount) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount || 0));
}

export const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const tokens = getTokens();
  if (tokens?.access) config.headers.Authorization = `Bearer ${tokens.access}`;
  return config;
});

let refreshing = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const tokens = getTokens();
    if (error.response?.status === 401 && tokens?.refresh && !original?._retried) {
      original._retried = true;
      refreshing =
        refreshing ||
        axios
          .post(REFRESH_URL, { refresh: tokens.refresh })
          .then((res) => {
            setTokens({ ...tokens, access: res.data.access });
            return res;
          })
          .finally(() => {
            refreshing = null;
          });
      try {
        await refreshing;
        return api(original);
      } catch {
        setTokens(null);
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);