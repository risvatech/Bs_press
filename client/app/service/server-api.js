 // service/server-api.js
import axios from "axios";

// Server-side axios instance with different configuration
const serverApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "https://www.bspressproducts.com/api",
    headers: {
        "Content-Type": "application/json",
    },
    timeout: 10000, // 10 second timeout for server
    withCredentials: false, // No cookies needed on server
});

// Add better error handling for server side
serverApi.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('Server API Error:', {
            message: error.message,
            url: error.config?.url,
            status: error.response?.status,
        });

        // Return a fallback response instead of throwing
        return Promise.resolve({
            data: null,
            status: error.response?.status || 500,
        });
    }
);

export default serverApi;