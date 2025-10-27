import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_SECRET = process.env.REFRESH_TOKEN_SECRET;

// POST /api/auth/refresh
export const refreshToken = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(401).json({ message: "No token provided" });

    const stored = await pool.query("SELECT * FROM refresh_tokens WHERE token=$1", [token]);
    if (stored.rows.length === 0) return res.status(403).json({ message: "Invalid refresh token" });

    jwt.verify(token, REFRESH_SECRET, (err, user) => {
      if (err) return res.status(403).json({ message: "Invalid or expired refresh token" });

      const accessToken = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        JWT_SECRET,
        { expiresIn: "1h" }
      );

      res.json({ accessToken });
    });
  } catch (error) {
    console.error("Refresh token error:", error.message);
    res.status(500).json({ message: "Token refresh failed" });
  }
};

// POST /api/auth/logout
export const logout = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ message: "No token provided" });

    await pool.query("DELETE FROM refresh_tokens WHERE token=$1", [token]);
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error.message);
    res.status(500).json({ message: "Logout failed" });
  }
};
