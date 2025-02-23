import axios from 'axios';
import { LoginData, RegisterData } from '../interfaces/AuthencationData';

const API_URL = 'http://localhost:3000/api/auth'; // Thay đổi URL nếu cần

const AuthService = {
  register: async (userData : RegisterData) => {
    return axios.post(`${API_URL}/register`, userData);
  },

  login: async (credentials : LoginData) => {
    const response = await axios.post(`${API_URL}/login`, credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getToken: () => {
    return localStorage.getItem('token');
  },

  verifyToken: async () => {
    const token = AuthService.getToken();
    if (!token) return false;

    try {
      const  response = await axios.get(`${API_URL}/verify`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      AuthService.logout();
      return false;
    }
  },
};

export default AuthService;
