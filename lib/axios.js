import axios from "axios";

const api = axios.create({
  baseURL: "https://dummyjson.com",
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("pad_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) return Promise.reject(error);

    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong. Please try again.";

    if (status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("pad_token");
      localStorage.removeItem("pad_user");
      document.cookie = "pad_token=; path=/; max-age=0";
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }

    return Promise.reject({ message, status, raw: error });
  }
);

export default api;
