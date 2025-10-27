import express from "express";
import pool from "../config/db.js";

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

export default router;
