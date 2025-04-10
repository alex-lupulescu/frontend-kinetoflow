import axios from 'axios';
import { useAuthStore } from '@/stores/auth'; // Import Pinia store

// Base configuration for Axios
const apiClient = axios.create({
    baseURL: 'http://localhost:8080/api', // Your Spring Boot backend API base URL
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Add JWT token to headers if available
apiClient.interceptors.request.use(
    (config) => {
        const authStore = useAuthStore(); // Get store instance inside interceptor
        const token = authStore.user?.token; // Access token from store state

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        console.log('Axios Request Config:', config); // For debugging
        return config;
    },
    (error) => {
        console.error('Axios Request Error:', error); // For debugging
        return Promise.reject(error);
    }
);

 // Optional: Response Interceptor (e.g., for handling 401 errors globally)
apiClient.interceptors.response.use(
    (response) => {
        console.log('Axios Response:', response); // For debugging
        return response; // Simply return successful responses
    },
    (error) => {
        console.error('Axios Response Error:', error.response || error.message); // Log error details
        const authStore = useAuthStore();

        // Check if it's a 401 Unauthorized error (token expired or invalid)
        if (error.response && error.response.status === 401) {
            console.warn('Unauthorized (401) detected. Logging out.');
            // Automatically log out the user if the token is invalid/expired
            authStore.logout();
            // Redirect to login page (can also be handled by router guard)
            // import router from '@/router'; // Be careful with circular dependencies
            // router.push('/login');
        }

        // Important: Always reject the promise so the calling function knows there was an error
        return Promise.reject(error);
    }
);


export default apiClient;