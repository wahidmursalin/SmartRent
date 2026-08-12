import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach JWT token to every request if present
api.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("smartrent_user"));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auto logout on 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("smartrent_user");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ---- Auth ----
export const registerUser = (data) => api.post("/auth/register", data);
export const loginUser = (data) => api.post("/auth/login", data);
export const getProfile = () => api.get("/auth/profile");
export const updateProfile = (data) => api.put("/auth/profile", data);

// ---- Houses ----
export const getHouses = (params) => api.get("/houses", { params });
export const getHouseById = (id) => api.get(`/houses/${id}`);
export const getMyHouses = () => api.get("/houses/my-houses");
export const createHouse = (data) => api.post("/houses", data);
export const updateHouse = (id, data) => api.put(`/houses/${id}`, data);
export const deleteHouse = (id) => api.delete(`/houses/${id}`);

// ---- Bookings ----
export const createBooking = (data) => api.post("/bookings", data);
export const getMyBookings = () => api.get("/bookings/my-bookings");
export const getBookingRequests = () => api.get("/bookings/requests");
export const approveBooking = (id) => api.put(`/bookings/${id}/approve`);
export const rejectBooking = (id) => api.put(`/bookings/${id}/reject`);
export const cancelBooking = (id) => api.put(`/bookings/${id}/cancel`);

// ---- Favorites ----
export const getFavorites = () => api.get("/favorites");
export const toggleFavorite = (houseId) => api.post(`/favorites/${houseId}`);

// ---- Saved Searches ----
export const getSavedSearches = () => api.get("/saved-searches");
export const createSavedSearch = (data) => api.post("/saved-searches", data);
export const deleteSavedSearch = (id) => api.delete(`/saved-searches/${id}`);

// ---- Messages ----
export const startConversation = (data) => api.post("/messages/start", data);
export const getConversations = () => api.get("/messages/conversations");
export const getMessages = (conversationId) => api.get(`/messages/${conversationId}`);
export const sendMessage = (conversationId, text) =>
  api.post(`/messages/${conversationId}`, { text });

export default api;
