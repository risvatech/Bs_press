import axios from "axios";

const productapi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "https://www.bspressproducts.com/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

// Add response interceptor
productapi.interceptors.response.use(
    (response) => {
        return response.data; // Return only the data part
    },
    (error) => {
        console.error('API Error:', error.config?.url, error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default productapi;