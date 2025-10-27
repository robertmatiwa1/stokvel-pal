import express from "express";
import { verifyToken } from "../middleware/authMiddleware.js";
import { addGroup, listGroups, getGroup } from "../controllers/groupController.js";

const router = express.Router();

router.post("/groups", verifyToken, addGroup);
router.get("/groups", listGroups);
router.get("/groups/:id", getGroup);

export default router;
