import express from "express";
import multer from "multer";
import {
  verifyParticipant,
  getPosters,
  adminGetPosters,
  adminCreatePoster,
  adminEditPoster,
  adminDeletePoster,
  adminBulkUploadPosters
} from "../controllers/posterController.js";
import { requireAuth, requireRole } from "../middleware/authMiddleware.js";

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 } // Support large files/PDFs up to 25MB
});

// Participant view endpoints
router.post("/verify", verifyParticipant);
router.get("/list/:conferenceId", getPosters);

// Administrative management endpoints
router.get("/admin/list/:conferenceId", requireAuth, requireRole(["admin"]), adminGetPosters);
router.post(
  "/admin/create",
  requireAuth,
  requireRole(["admin"]),
  upload.fields([
    { name: "posterFile", maxCount: 1 },
    { name: "thumbnailFile", maxCount: 1 }
  ]),
  adminCreatePoster
);
router.put(
  "/admin/edit/:id",
  requireAuth,
  requireRole(["admin"]),
  upload.fields([
    { name: "posterFile", maxCount: 1 },
    { name: "thumbnailFile", maxCount: 1 }
  ]),
  adminEditPoster
);
router.delete("/admin/delete/:id", requireAuth, requireRole(["admin"]), adminDeletePoster);
router.post("/admin/bulk-upload", requireAuth, requireRole(["admin"]), adminBulkUploadPosters);

export default router;
