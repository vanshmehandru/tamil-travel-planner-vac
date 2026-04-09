import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('namma_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

apiClient.interceptors.response.use((response) => response, (error) => {
  if (error.response && error.response.status === 401) {
    localStorage.removeItem('namma_token');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

export const authAPI = {
  register: (data) => apiClient.post('/auth/register', data),
  login: (data) => apiClient.post('/auth/login', data),
  getMe: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.put('/auth/profile', data),
  changePassword: (data) => apiClient.put('/auth/change-password', data),
};

export const travelAPI = {
  searchTravel: (params) => apiClient.get('/travel/search', { params }), // source, destination, type, date, passengers
  getOptions: () => apiClient.get('/travel/options'),
  getById: (id) => apiClient.get(`/travel/${id}`),
  getSeats: (id) => apiClient.get(`/travel/${id}/seats`),
};

export const bookingAPI = {
  createBooking: (data) => apiClient.post('/bookings', data),
  getMyBookings: () => apiClient.get('/bookings/my-bookings'),
  getById: (id) => apiClient.get(`/bookings/${id}`),
  cancelBooking: (id) => apiClient.put(`/bookings/${id}/cancel`),
};

export const ticketAPI = {
  getMyTickets: () => apiClient.get('/tickets/my-tickets'),
  getByPNR: (pnrNumber) => apiClient.get(`/tickets/pnr/${pnrNumber}`),
  getById: (id) => apiClient.get(`/tickets/${id}`),
  downloadTicket: (id) => apiClient.get(`/tickets/${id}/download`),
  saveTicket: (id) => apiClient.post(`/tickets/${id}/save`),
  unsaveTicket: (id) => apiClient.delete(`/tickets/${id}/save`),
  checkIsSaved: (id) => apiClient.get(`/tickets/${id}/is-saved`),
};

export const nlpAPI = {
  parseText: (data) => apiClient.post('/nlp/parse', data),
  getCities: (query) => apiClient.get(`/nlp/cities?q=${query}`),
};
