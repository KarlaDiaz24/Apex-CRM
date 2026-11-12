import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use((config) => {
    const role = localStorage.getItem('userRole') || 'admin';
    config.headers['x-user-role'] = role;
    return config;
});

export default api;