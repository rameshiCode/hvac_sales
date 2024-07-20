import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VUE_APP_API_BASE_URL,
    withCredentials: true, // Add this line
});

// Add a request interceptor
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        } else {
            delete config.headers.Authorization;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;

export function setAuthToken() {
    const token = localStorage.getItem('token');
    if (token) {
        apiClient.defaults.headers.common['Authorization'] = 'Token ' + token;
    } else {
        delete apiClient.defaults.headers.common['Authorization'];
    }
}

export function deleteAuthToken() {
    let token = localStorage.getItem('token')
    if (token)
        localStorage.removeItem('token')
}
