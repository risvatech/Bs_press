import axios from "axios";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "https://www.bspressproducts.com/api",
    withCredentials: true,
    headers: {
        "Content-Type": "application/json",
    },
});

export default api;