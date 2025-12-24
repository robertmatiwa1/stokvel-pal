import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import { pool } from "../config/db.js";

const signToken = (user) => {
  return jwt.sign(
    { id: user.id, phone: user.phone, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { phone, pin, role, username } = req.body;

    if (!phone || !pin) {
      return res.status(400).json({ message: "phone and pin are required" });
    }

    const cleanPhone = String(phone).trim();
    const cleanRole = role ? String(role).trim().toLowerCase() : "user";
    const cleanUsername = username && String(username).trim()
    ? String(username).trim()
    : `user_${cleanPhone.replace(/\D/g, "")}`;

    if (!["user", "admin"].includes(cleanRole)) {
      return res.status(400).json({ message: "role must be user or admin" });
    }

    const existing = await pool.query(
      "SELECT id FROM users WHERE phone = $1 OR username = $2 LIMIT 1",
      [cleanPhone, cleanUsername]
    );

    if (existing.rowCount > 0) {
      return res.status(409).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(String(pin), 10);
    const id = uuidv4();

    const created = await pool.query(
      `INSERT INTO users (id, username, phone, pin_hash, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, username, phone, role`,
      [id, cleanUsername, cleanPhone, hashed, cleanRole]
    );

    const user = created.rows[0];
    const token = signToken(user);

    return res.status(201).json({ user, token });
  } catch (err) {
    console.error("register error:", err);
    return res.status(500).json({ message: "Server error", error: String(err.message || err) });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { phone, pin } = req.body;

    if (!phone || !pin) {
      return res.status(400).json({ message: "phone and pin are required" });
    }

    const cleanPhone = String(phone).trim();

    const found = await pool.query(
      "SELECT id, phone, pin_hash, role FROM users WHERE phone = $1 LIMIT 1",
      [cleanPhone]
    );

    if (found.rowCount === 0) {
      return res.status(401).json({ message: "Invalid phone or PIN" });
    }

    const userRow = found.rows[0];
    const ok = await bcrypt.compare(String(pin), userRow.pin_hash);

    if (!ok) {
      return res.status(401).json({ message: "Invalid phone or PIN" });
    }

    const user = { id: userRow.id, phone: userRow.phone, role: userRow.role };
    const token = signToken(user);

    return res.json({ user, token });
  } catch (err) {
    console.error("login error:", err);
    return res.status(500).json({ message: "Server error", error: String(err.message || err) });
  }
};
