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

// DB
await connectDB();

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// Test route
app.get('/', (req, res) => res.send("Server is running"));

// Routes
app.use('/api/user', userRouter);
app.use('/api/owner', ownerRouter);
app.use('/api/inquiries', bookingRouter);
app.use('/api/payment', paymentRouter);
app.use("/api/newsletter", newsletterRouter);

// Static
app.use('/uploads', express.static('uploads'));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));