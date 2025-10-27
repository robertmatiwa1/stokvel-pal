import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import membershipRoutes from "./routes/membershipRoutes.js";

app.use("/api", membershipRoutes);
app.use("/api", groupRoutes);

app.use("/api/auth", authRoutes);
router.get("/users/profile", verifyToken, getProfile);

dotenv.config();

console.log("Loaded DATABASE_URL:", process.env.DATABASE_URL);

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Default route
app.get("/", (req, res) => {
  res.send("Welcome to Stokvel-Pal API");
});

// API routes
app.use("/api", userRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
