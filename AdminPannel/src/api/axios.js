  import axios from "axios";



  export const BASE_URL = "http://localhost:5000";

  export const API_URL = `${BASE_URL}/api`;

  export const IMG_URL = BASE_URL;


  const API = axios.create({
    baseURL: API_URL,

    timeout: 30000,

    headers: {
      Accept: "application/json",
    },

    // Use this later if backend uses cookies
    withCredentials: false,
  });


  API.interceptors.request.use(
    (config) => {

      const token =
        localStorage.getItem("token");

      if (token) {
        config.headers.Authorization =
          `Bearer ${token}`;
      }

      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
      }

      return config;
    },

    (error) => {
      console.error(
        "Request Error:",
        error
      );

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
      // ====================================
      // Backend responded with an error
      // ====================================

      if (error.response) {
        console.error(
          "API Error:",
          {
            status:
              error.response.status,

            message:
              error.response.data?.message,

            data:
              error.response.data,
          }
        );
      }

      // ====================================
      // Request sent but server unavailable
      // ====================================

      else if (error.request) {
        console.error(
          "Server not responding"
        );

        console.error(
          "Requested URL:",
          `${error.config?.baseURL || ""}${error.config?.url || ""}`
        );
      }

      // ====================================
      // Axios configuration error
      // ====================================

      else {
        console.error(
          "Axios Error:",
          error.message
        );
      }

      return Promise.reject(error);
    }
  );

  // ========================================
  // EXPORT
  // ========================================

  export default API;
