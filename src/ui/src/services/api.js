// src/services/api.js

import axios from "axios";

// Create a custom Axios instance
const api = axios.create({
  baseURL: `https://${process.env.BACKEND_URL}:${process.env.PORT}`, // Replace with your API base URL
});

// Add request interceptor
api.interceptors.request.use(
  (config) => {
    // Modify the request config if necessary
    console.log("Request made to:", config.url);

    // Add any custom headers, like authorization
    config.headers["Authorization"] = "Bearer your-token"; // Example of adding auth header

    return config;
  },
  (error) => {
    // Handle request error here
    return Promise.reject(error);
  }
);

// Add response interceptor
api.interceptors.response.use(
  (response) => {
    // Handle the response data
    console.log("Response received from:", response.config.url);
    console.log("Data:", response.data);

    // Call the custom function when data is received
    onDataReceived(response.data);

    return response;
  },
  (error) => {
    // Handle response error here
    return Promise.reject(error);
  }
);

// Custom function to trigger when data is received
function onDataReceived(data) {
  console.log("New data received:", data);
  // Additional logic when data is received
  // For example, you can trigger Vuex actions, update the UI, etc.
}

export default api;
