import express from "express";
import { verifyToken as auth } from "../middleware/authMiddleware.js";
import * as membershipModel from "../models/membershipModel.js";

const router = express.Router();

// GET /api/memberships/group/:groupId
router.get("/group/:groupId", auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const members = await membershipModel.listMembers(groupId);
    return res.json(members);
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

// POST /api/memberships/join/:groupId
router.post("/join/:groupId", auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user.id; // must match what your auth middleware sets
    const member = await membershipModel.joinGroup(groupId, userId);
    return res.status(201).json(member);
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

// POST /api/memberships/add/:groupId
router.post("/add/:groupId", auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const { username, phone } = req.body;

    if (!username || !phone) {
      return res.status(400).json({ message: "username and phone are required" });
    }

    const member = await membershipModel.addMemberToGroup(groupId, username, phone);
    return res.status(201).json(member);
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

export default router;
