// backend/src/routes/membershipRoutes.js
import express from "express";
import { verifyToken as auth } from "../middleware/authMiddleware.js";
import * as membershipModel from "../models/membershipModel.js";
import { requireGroupRole } from "../middleware/requireGroupRole.js";

const router = express.Router();

// GET /api/memberships/group/:groupId  (ANY MEMBER)
router.get(
  "/group/:groupId",
  auth,
  requireGroupRole("member"),
  async (req, res) => {
    try {
      const { groupId } = req.params;
      const members = await membershipModel.listMembers(groupId);
      return res.json(members);
    } catch (err) {
      return res.status(500).json({ message: err.message || "Server error" });
    }
  }
);

// GET /api/memberships/role/:groupId  (ANY MEMBER, OR 403 if not member)
router.get("/role/:groupId", auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user?.id;

    if (!userId || !groupId) {
      return res.status(400).json({ message: "Missing user or group" });
    }

    const role = await membershipModel.getMembershipRole(groupId, userId);

    if (!role) {
      return res.status(403).json({ message: "Not a member of this group" });
    }

    return res.json({ role });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

// POST /api/memberships/join/:groupId
router.post("/join/:groupId", auth, async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.user?.id;

    if (!userId || !groupId) {
      return res.status(400).json({ message: "Missing user or group" });
    }

    const result = await membershipModel.joinGroup(groupId, userId);

    if (result?.status === "already_member") {
      return res.status(200).json({
        status: "already_member",
        message: "Already a member of this group",
        membership: result.membership
      });
    }

    return res.status(201).json({
      status: "joined",
      message: "Joined group successfully",
      membership: result?.membership ?? null
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Server error" });
  }
});

// POST /api/memberships/add/:groupId  (ADMIN OR OWNER)
router.post(
  "/add/:groupId",
  auth,
  requireGroupRole("admin"),
  async (req, res) => {
    try {
      const { groupId } = req.params;
      const { username, phone } = req.body;

      if (!username || !phone) {
        return res.status(400).json({ message: "username and phone are required" });
      }

      const result = await membershipModel.addMemberToGroup(groupId, username, phone);

      if (result?.status === "already_member") {
        return res.status(200).json({
          status: "already_member",
          message: "User is already a member of this group",
          member: result.member
        });
      }

      return res.status(201).json({
        status: "added",
        message: "Member added successfully",
        member: result?.member ?? null
      });
    } catch (err) {
      return res.status(500).json({ message: err.message || "Server error" });
    }
  }
);

export default router;
