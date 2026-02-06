import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import rolesRoutes from "./routes/rolesRoutes.js";
import { testDbConnection } from "./db/sql.js";
import os from "os";
import {errorHandler} from "./middlewares/errorHandler.js";
import installRoutes from "./routes/installRoutes.js";
import uploadRoute from "./routes/uploadRoute.js";
import contactRoutes from "./routes/contactRoutes.js";
import postsRoutes from "./routes/postsRoutes.js";
import path from "path";
import categoryRoutes from "./routes/categoryRoutes.js";
import productsRoutes from "./routes/productsRoutes.js";
import productcategoriesRoutes from "./routes/productcategoriesRoutes.js";
import quoteRoutes from "./routes/quoteRoutes.js";


dotenv.config();

const app = express();

// ================== MIDDLEWARES ==================
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// ✅ CORS setup
app.use(
    cors({
        origin: ["http://localhost:3000", "www.bspressproducts.com", "http://localhost:3001"],
        credentials: true,
    }),
);

const uploadPath = "/var/www/bs_press-backend/uploads";

app.use("/api/uploads", express.static(path.resolve(uploadPath)));
// app.use("/api/uploads", express.static(path.resolve("uploads")));

// ================== API ROUTES ==================

app.use("/api", installRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/roles", rolesRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/products', productsRoutes);
app.use("/api/productcategories", productcategoriesRoutes);
app.use("/api/upload", uploadRoute);
app.use("/api/contact", contactRoutes);
app.use("/api/categories", categoryRoutes);
app.use('/api/quotes', quoteRoutes);




app.post("/api/testDatabaseDetails", async (req, res) => {
    try {
        console.log("Received:", req.body);

        // Example response
        res.json({ success: true, message: "Database test endpoint works!" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ================== ROOT CHECK ==================
app.get("/", (req, res) => res.send("✅ API is running..."));

// ================== ERROR HANDLER ==================
app.use(errorHandler);

// Logger middleware (optional, can be commented out in production)
app.use((req, res, next) => {
    console.log(`📥 ${req.method} ${req.url}`);
    // console.log("🔸 Request Body:", req.body);

    const oldSend = res.send;
    res.send = function (data) {
        console.log("📤 Response:", data.toString());
        oldSend.apply(res, arguments);
    };

    next();
});

// For local use only
const getLocalIPAddress = () => {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === "IPv4" && !iface.internal) {
                return iface.address;
            }
        }
    }
    return "localhost";
};

const PORT = process.env.PORT || 8009;
const LOCAL_IP = getLocalIPAddress();

// ================== START SERVER ==================
testDbConnection().then(() => {
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`🟢 Server running at:`);
        console.log(`   👉 Localhost: http://localhost:${PORT}`);
        console.log(`   👉 Mobile:    http://${LOCAL_IP}:${PORT}`);
    });
});
