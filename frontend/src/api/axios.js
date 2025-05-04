// src/api/axios.js
import axios from "axios";

const API = axios.create({
  baseURL:
    process.env.NODE_ENV === "production"
      ? "https://expense-tracker-app-knl1.onrender.com/api"  // Render backend URL
      : "http://localhost:5000/api",                          // Local backend URL
  withCredentials: true, // Send cookies / credentials
});

export default API;
