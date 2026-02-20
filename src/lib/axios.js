import axios from 'axios';

// Create an axios instance
// The base URL will be the Web App URL from Google Apps Script
// We'll set this via environment variable VITE_API_URL
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'text/plain;charset=utf-8', // GAS requires this content type often to avoid CORS preflight issues or redirect issues
    },
});

// Interceptor to handle response data effectively
api.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
