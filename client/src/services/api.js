import axios from "axios";

// The backend server URL will be read from environment variables
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // This is crucial for sending cookies (like the auth token) with requests
});

// --- Auth Service ---
export const loginUser = (credentials) =>
  apiClient.post("/auth/login", credentials);
export const registerUser = (userData) =>
  apiClient.post("/auth/register", userData);
export const logoutUser = () => apiClient.post("/auth/logout");
export const checkAuthStatus = () => apiClient.get("/auth/status");

// --- ToDo Service ---
export const getTodos = () => apiClient.get("/todos");
export const createTodo = (todoData) => apiClient.post("/todos", todoData);
export const updateTodo = (id, todoData) =>
  apiClient.put(`/todos/${id}`, todoData);
export const deleteTodo = (id) => apiClient.delete(`/todos/${id}`);

export default apiClient;
