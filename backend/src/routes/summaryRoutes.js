import express from "express";
import { monthlySummary } from "../controllers/summaryController.js";
import { verifyToken } from "../middleware/authMiddleware.js";
import { requireGroupMember } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/groups/:groupId/monthly-summary",
  verifyToken,
  requireGroupMember,
  monthlySummary
);

export default router;
