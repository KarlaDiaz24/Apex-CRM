import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
});

// Interceptor para enviar el rol en las peticiones (simulando sesión de admin por ahora)
api.interceptors.request.use((config) => {
    const role = localStorage.getItem('userRole') || 'admin';
    config.headers['x-user-role'] = role;
    return config;
});

export default api;