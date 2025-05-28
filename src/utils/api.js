import axios from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';

// Create axios instance with default config
const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        // Get token from cookie
        const token = Cookies.get('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized errors
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                // Try to refresh token
                const refreshToken = Cookies.get('refreshToken');
                if (refreshToken) {
                    const response = await axios.post('/api/auth/refresh-token', {
                        refreshToken
                    });

                    const { token } = response.data;
                    Cookies.set('token', token, { 
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict'
                    });

                    originalRequest.headers.Authorization = `Bearer ${token}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // If refresh token fails, logout user
                Cookies.remove('token');
                Cookies.remove('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        // Handle other errors
        const errorMessage = error.response?.data?.message || 'An error occurred';
        toast.error(errorMessage);
        return Promise.reject(error);
    }
);

// Secure API methods
export const secureApi = {
    get: async (url, config = {}) => {
        try {
            const response = await api.get(url, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    post: async (url, data = {}, config = {}) => {
        try {
            const response = await api.post(url, data, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    put: async (url, data = {}, config = {}) => {
        try {
            const response = await api.put(url, data, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    delete: async (url, config = {}) => {
        try {
            const response = await api.delete(url, config);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default secureApi; 