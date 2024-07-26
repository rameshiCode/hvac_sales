import axios from 'axios';

// Load environment variable
const baseURL = import.meta.env.VITE_API_URL;

const apiClient = axios.create({
  baseURL: baseURL, // Base URL for all calls to API
  headers: {
    'Content-Type': 'application/json', // Ensures all requests use JSON
  },
  timeout: 10000, // Wait for 10 seconds before aborting the request
});

export default apiClient;
