import axios from "axios";

// Create Axios instance
const axiosInstance = axios.create({
  baseURL: "/api", // ✅ replace with your backend URL
  withCredentials: true,
  timeout: 10000, // optional: 10 sec timeout
  headers: {
    "Content-Type": "application/json",
  },
});



// 🧠 Request interceptor (runs before every request)
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // or cookies/session
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ⚡ Response interceptor (runs after every response)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Example: handle 401 errors globally
    if (error.response && error.response.status === 401) {
      console.warn("Unauthorized! Logging out...");
      localStorage.removeItem("token");
      // optional: redirect to login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
