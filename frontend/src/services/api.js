import axios from 'axios';

// Create axios instance with timeout and better defaults
const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true,
    timeout: 60000, // 60 second timeout for large uploads
});

// Request interceptor for adding token
api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Response interceptor for standardized error handling
api.interceptors.response.use((response) => {
    return response;
}, (error) => {
    // Handle 401 Unauthorized (Session expired or logged in elsewhere)
    if (error.response && error.response.status === 401) {
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('user');

        // Better error message based on backend response
        const message = error.response.data?.message || 'Sesi Anda telah berakhir';

        // Only redirect if not already on login page
        if (window.location.pathname !== '/login') {
            window.location.href = '/login';
        }

        return Promise.reject({
            message,
            userMessage: message
        });
    }

    // Standardize error messages in Bahasa Indonesia
    let errorMessage = 'Terjadi kesalahan. Silakan coba lagi.';

    if (error.code === 'ECONNABORTED') {
        errorMessage = 'Koneksi timeout. Periksa jaringan Anda dan coba lagi.';
    } else if (error.code === 'ERR_NETWORK' || !error.response) {
        errorMessage = 'Tidak dapat terhubung ke server. Periksa koneksi internet Anda.';
    } else if (error.response) {
        // Use backend error message if available
        const backendMessage = error.response.data?.message;
        if (backendMessage) {
            errorMessage = backendMessage;
        } else {
            // Provide user-friendly messages based on status code
            switch (error.response.status) {
                case 400:
                    errorMessage = 'Data yang dikirim tidak valid. Periksa kembali formulir Anda.';
                    break;
                case 403:
                    errorMessage = 'Anda tidak memiliki akses untuk melakukan aksi ini.';
                    break;
                case 404:
                    errorMessage = 'Data yang diminta tidak ditemukan.';
                    break;
                case 409:
                    errorMessage = 'Data sudah ada atau sedang diproses oleh pengguna lain.';
                    break;
                case 422:
                    errorMessage = 'Validasi gagal. Periksa kembali data yang Anda masukkan.';
                    break;
                case 500:
                    errorMessage = 'Terjadi kesalahan server. Silakan hubungi administrator.';
                    break;
                case 503:
                    errorMessage = 'Layanan sedang tidak tersedia. Coba lagi nanti.';
                    break;
            }
        }
    }

    // Attach standardized message to error object
    error.userMessage = errorMessage;

    return Promise.reject(error);
});

// Export ENDPOINTS for use in components
export { ENDPOINTS } from '../constants/apiEndpoints';

// Export base URL for document preview/download
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export default api;
