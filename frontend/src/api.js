// src/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3305/api'; // adjust if needed

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add a request interceptor to attach token
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Add this function to fetch private messages between two users
export const fetchPrivateMessages = (userId, otherUserId) => {
  return api.get(`/messages/private/${userId}/${otherUserId}`);
};

export default api;
