import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import BadgeTemplate from "../models/BadgeTemplate.js";
import Conference from "../models/Conference.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Setup Disk Storage for Multer to store template files locally
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = "./uploads/badge-templates";
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "badge-template-" + uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage });

// 1. Get all templates for a conference (supporting slug, ID, or name)
router.get("/conference/:conferenceId", async (req, res) => {
  try {
    const param = req.params.conferenceId?.trim();
    const queryConditions = [
      { conferenceId: param }
    ];

    const targetConference = await Conference.findOne({
      $or: [
        { slug: param },
        { name: param }
      ]
    }).catch(() => null);

    if (targetConference) {
      queryConditions.push({ conferenceId: targetConference._id.toString() });
    }

    const templates = await BadgeTemplate.find({
      $or: queryConditions
    });
    return res.status(200).json(templates);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 2. Create or Update a template
// Handles JSON payload and optional multipart background image upload
router.post("/", upload.single("backgroundImageFile"), async (req, res) => {
  try {
    const {
      _id,
      conferenceId,
      name,
      category,
      canvasWidthMm,
      canvasHeightMm,
      isDefault,
      fields
    } = req.body;

    if (!conferenceId || !name || !category) {
      return res.status(400).json({ error: "Missing required fields: conferenceId, name, or category" });
    }

    let parsedFields = [];
    if (fields) {
      parsedFields = typeof fields === "string" ? JSON.parse(fields) : fields;
    }

    let backgroundImage = req.body.backgroundImage || "";
    if (req.file) {
      backgroundImage = `uploads/badge-templates/${req.file.filename}`;
    }

    const templateData = {
      conferenceId,
      name,
      category,
      backgroundImage,
      canvasWidthMm: Number(canvasWidthMm || 86),
      canvasHeightMm: Number(canvasHeightMm || 54),
      isDefault: isDefault === "true" || isDefault === true,
      fields: parsedFields
    };

    // If marked as default, reset all other default templates for this conference
    if (templateData.isDefault) {
      await BadgeTemplate.updateMany(
        { conferenceId, category: { $ne: category } },
        { $set: { isDefault: false } }
      );
    }

    let template;
    if (_id) {
      // Update existing template
      template = await BadgeTemplate.findByIdAndUpdate(_id, templateData, { new: true });
      if (!template) {
        return res.status(404).json({ error: "Template not found" });
      }
    } else {
      // Create new template
      template = new BadgeTemplate(templateData);
      await template.save();
    }

    return res.status(200).json(template);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. Clone / Duplicate a template config
router.post("/:id/clone", async (req, res) => {
  try {
    const original = await BadgeTemplate.findById(req.params.id);
    if (!original) {
      return res.status(404).json({ error: "Original template not found" });
    }

    const clonedData = original.toObject();
    delete clonedData._id;
    delete clonedData.createdAt;
    delete clonedData.updatedAt;
    
    clonedData.name = `${original.name} (Copy)`;
    clonedData.category = `${original.category}-Copy-${Date.now().toString().slice(-4)}`;
    clonedData.isDefault = false;

    const clone = new BadgeTemplate(clonedData);
    await clone.save();

    return res.status(200).json(clone);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 4. Delete a template
router.delete("/:id", async (req, res) => {
  try {
    const template = await BadgeTemplate.findById(req.params.id);
    if (!template) {
      return res.status(404).json({ error: "Template not found" });
    }

    // Clean up template image file if present on disk
    if (template.backgroundImage && template.backgroundImage.startsWith("uploads/")) {
      const filePath = path.resolve("./" + template.backgroundImage);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.warn("Failed to delete badge background file:", filePath, e);
        }
      }
    }

    await BadgeTemplate.findByIdAndDelete(req.params.id);
    return res.status(200).json({ success: true, message: "Template deleted successfully" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export default router;
