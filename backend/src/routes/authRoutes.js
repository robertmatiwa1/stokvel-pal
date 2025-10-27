import express from "express";
import { register, login } from "../controllers/authController.js";
import { refreshToken, logout } from "../controllers/tokenController.js";

router.post("/refresh", refreshToken);
router.post("/logout", logout);

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

export default router;
