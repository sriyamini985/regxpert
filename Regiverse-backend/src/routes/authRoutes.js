import express from "express";
import { login, changeCredentials, getUserByRole } from "../controllers/authController.js";

const router = express.Router();

// Public routes for user/admin/client authentication
router.post("/login", login);
router.put("/change-credentials", changeCredentials);
router.get("/user/:role", getUserByRole);

export default router;
