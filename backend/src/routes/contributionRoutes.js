import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { postContribution, getGroupContributions } from "../controllers/contributionController.js";

const router = express.Router();

router.post("/", verifyToken, postContribution);
router.get("/group/:groupId", verifyToken, getGroupContributions);

export default router;
