import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireGroupRole } from "../middleware/requireGroupRole.js";
import { listMembersWithRoles, updateMemberRole, getMembershipRole } from "../models/membershipModel.js";

const router = express.Router();

/**
 * GET /api/groups/:groupId/me/role
 * returns: { role: "member" | "treasurer" | "secretary" | "chairperson" }
 */
router.get(
  "/groups/:groupId/me/role",
  verifyToken,
  async (req, res) => {
    const { groupId } = req.params;
    const role = await getMembershipRole(groupId, req.user.id);
    if (!role) return res.status(403).json({ message: "Not a member of this group" });
    return res.json({ role });
  }
);

/**
 * GET /api/groups/:groupId/members/roles
 * chairperson + treasurer can view roles list
 */
router.get(
  "/groups/:groupId/members/roles",
  verifyToken,
  requireGroupRole(["chairperson", "treasurer"]),
  async (req, res) => {
    const { groupId } = req.params;
    const rows = await listMembersWithRoles(groupId);
    return res.json(rows);
  }
);

/**
 * PATCH /api/groups/:groupId/members/:userId/role
 * chairperson only
 */
router.patch(
  "/groups/:groupId/members/:userId/role",
  verifyToken,
  requireGroupRole(["chairperson"]),
  async (req, res) => {
    const { groupId, userId } = req.params;
    const { role } = req.body;

    const allowed = ["chairperson", "treasurer", "secretary", "member"];
    if (!allowed.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    // MVP guardrail
    if (req.user.id === userId && role !== "chairperson") {
      return res.status(400).json({ message: "Chairperson cannot demote self in MVP" });
    }

    const updated = await updateMemberRole(groupId, userId, role, req.user.id);
    if (!updated) {
      return res.status(404).json({ message: "Member not found in group" });
    }

    return res.json(updated);
  }
);

export default router;
