import axios from 'axios';

const api = axios.create({
    baseURL: 'https://apex-crm-7rh1.onrender.com/api',
});

api.interceptors.request.use((config) => {
    const role = localStorage.getItem('userRole') || 'admin';
    config.headers['x-user-role'] = role;
    return config;
});

export default api;