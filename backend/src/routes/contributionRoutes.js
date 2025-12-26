import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { postContribution, getGroupContributions, verify, reject } from "../controllers/contributionController.js";
import { requireGroupRole } from "../middleware/requireGroupRole.js";

const router = express.Router();

// POST /api/contributions  (ANY MEMBER, creates PENDING)
router.post("/", verifyToken, requireGroupRole("member"), postContribution);

// GET /api/contributions/group/:groupId  (ANY MEMBER)
// Optional, /group/:groupId?status=pending|verified|rejected
router.get("/group/:groupId", verifyToken, requireGroupRole("member"), getGroupContributions);

// PATCH /api/contributions/:id/verify  (ADMIN OR OWNER)
router.patch("/:id/verify", verifyToken, requireGroupRole("admin"), verify);

// PATCH /api/contributions/:id/reject  (ADMIN OR OWNER)
router.patch("/:id/reject", verifyToken, requireGroupRole("admin"), reject);

export default router;
