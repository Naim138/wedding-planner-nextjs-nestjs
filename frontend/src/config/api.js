import axios from "axios";
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const POSSIBLE_URLS = [
  process.env.NEXT_PUBLIC_API_URL,
  "http://localhost:5000/api/v1",
  "http://10.0.2.2:5000/api/v1",
  "http://10.41.132.107:5000/api/v1",
  "http://192.168.1.34:5000/api/v1"
].filter(Boolean);

let currentUrlIndex = 0; // Default to localhost for web development

export const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    const customUrl = localStorage.getItem("custom_api_url");
    if (customUrl) {
      return customUrl;
    }
  }
  return POSSIBLE_URLS[currentUrlIndex];
};

export const setCustomApiUrl = (url) => {
  if (typeof window !== "undefined") {
    if (url) {
      localStorage.setItem("custom_api_url", url);
    } else {
      localStorage.removeItem("custom_api_url");
    }
  }
};

export const API_BASE_URL = getApiBaseUrl(); // Keep for compatibility

const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Dynamic request interceptor to auto-inject token and set dynamic baseURL
api.interceptors.request.use(
  (config) => {
    config.baseURL = getApiBaseUrl();
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Self-healing Axios interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!error.response && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // If we are using a custom URL, don't cycle (as it is user-configured)
      if (typeof window !== "undefined" && localStorage.getItem("custom_api_url")) {
        return Promise.reject(error);
      }
      
      // Cycle to the next possible URL
      currentUrlIndex = (currentUrlIndex + 1) % POSSIBLE_URLS.length;
      const nextURL = POSSIBLE_URLS[currentUrlIndex];
      
      console.log(`[API Config] Network error. Retrying request with alternative URL: ${nextURL}`);
      originalRequest.baseURL = nextURL;
      
      return api(originalRequest);
    }
    return Promise.reject(error);
  }
);

// Dynamic RTK Query base query wrapper with automatic header preparation
export const dynamicBaseQuery = (subPath) => {
  return async (args, api, extraOptions) => {
    const rawBaseQuery = fetchBaseQuery({ 
      baseUrl: `${getApiBaseUrl()}${subPath}`,
      prepareHeaders: (headers) => {
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("token");
          if (token) {
            headers.set("Authorization", `Bearer ${token}`);
          }
        }
        return headers;
      }
    });
    return rawBaseQuery(args, api, extraOptions);
  };
};

export default api;
