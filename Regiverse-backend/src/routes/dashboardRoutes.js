import express from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/dashboard/stats
router.get("/stats", requireAuth, getDashboardStats);

export default router;