import axios from "axios";

// ========================================
// BASE URL
// ========================================

export const BASE_URL = "http://localhost:5000";
export const API_URL = `${BASE_URL}/api`;
export const IMG_URL = BASE_URL;

// ========================================
// AXIOS INSTANCE
// ========================================

const API = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    Accept: "application/json",
  },

  // Required for HTTP-only cookies
  withCredentials: true,
});

// ========================================
// REQUEST INTERCEPTOR
// ========================================

API.interceptors.request.use(
  (config) => {
    // Do not manually set Content-Type for FormData
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// ========================================
// RESPONSE INTERCEPTOR
// ========================================

API.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      console.error("API Error:", {
        status: error.response.status,
        message: error.response.data?.message,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error("Server not responding");
      console.error(
        "Requested URL:",
        `${error.config?.baseURL || ""}${error.config?.url || ""}`
      );
    } else {
      console.error("Axios Error:", error.message);
    }

    return Promise.reject(error);
  }
);

export default API;