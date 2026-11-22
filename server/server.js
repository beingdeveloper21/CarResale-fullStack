import express from "express";
import "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";

import userRouter from "./routes/userRoutes.js";
import ownerRouter from "./routes/ownerRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";
import newsletterRouter from "./routes/newsletterRoutes.js";

const app = express();

// Database Connection
await connectDB();

// CORS setup
const allowedOrigins = (process.env.CORS_ORIGINS || process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin) || allowedOrigins.includes("*")) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());

// Static file serving for uploads fallback
app.use("/uploads", express.static("uploads"));

// Health and Root checks
app.get("/", (req, res) => res.json({ status: "ok", service: "Car Resale API", version: "2.1.0" }));
app.get("/health", (req, res) => res.json({ success: true, timestamp: new Date().toISOString() }));

// API Routes
app.use("/api/user", userRouter);
app.use("/api/owner", ownerRouter);
app.use("/api/inquiries", bookingRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/newsletter", newsletterRouter);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
