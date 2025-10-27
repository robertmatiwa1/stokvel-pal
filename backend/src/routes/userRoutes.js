import express from "express";
import pool from "../config/db.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { getUsers, getProfile } from "../controllers/userController.js";

const router = express.Router();

router.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ server_time: result.rows[0].now });
  } catch (error) {
  console.error("Database connection error:", error);
  res.status(500).json({ message: "Database error", error: error.message });
  }
});
router.get("/users/profile", verifyToken, getProfile);

export default router;

