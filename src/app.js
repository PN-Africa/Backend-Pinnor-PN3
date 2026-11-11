
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { setupSwagger } from "./config/swagger.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import providerRoutes from "./routes/providerRoutes.js";
import availabilityRoutes from "./routes/availabilityRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Global middleware
app.use(helmet());
app.use(cors({
  origin: [
    "https://pinnor-frontend.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(morgan("dev"));
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    timestamp: new Date().toISOString()
  });
});

// API documentation
setupSwagger(app);

// Route mounts
app.use("/api/auth", authRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/availability", availabilityRoutes);
app.use("/api/bookings", bookingRoutes);

// Global error handler
app.use(errorHandler);

export default app;
