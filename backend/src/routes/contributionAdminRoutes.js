import express from "express";
import { editContribution, removeContribution } from "../controllers/contributionAdminController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireGroupRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

/**
 * Edit contribution (admin only for that group)
 * PATCH /api/contributions/:contributionId
 * Body may include: amount, paid_at, note
 * Must include groupId in body so role middleware can check group
 */
router.patch(
  "/contributions/:contributionId",
  verifyToken,
  requireGroupRole("admin"),
  editContribution
);

/**
 * Delete contribution (admin only for that group)
 * POST /api/contributions/:contributionId/delete
 * Body must include groupId, and optional reason
 */
router.post(
  "/contributions/:contributionId/delete",
  verifyToken,
  requireGroupRole("admin"),
  removeContribution
);

export default router;
