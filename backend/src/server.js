import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import membershipRoutes from "./routes/membershipRoutes.js";
import jobRoutes from "./jobs/job.controller.js";
import reviewRoutes from "./reviews/review.controller.js";
import paymentRoutes from "./payments/payment.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

console.log("Loaded DATABASE_URL:", process.env.DATABASE_URL);

// Default route
app.get("/", (req, res) => {
  res.send("Welcome to Stokvel-Pal API");
});

// API routes
app.use("/api", userRoutes);
app.use("/api", groupRoutes);
app.use("/api", membershipRoutes);
app.use("/api", jobRoutes);
app.use("/api", reviewRoutes);
app.use("/api", paymentRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
