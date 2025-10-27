import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { join, leave, listMembers } from "../controllers/membershipController.js";

const router = express.Router();

router.post("/memberships/join/:group_id", verifyToken, join);
router.delete("/memberships/leave/:group_id", verifyToken, leave);
router.get("/memberships/group/:group_id", verifyToken, listMembers);

export default router;
