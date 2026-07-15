import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import Poster from "../models/Poster.js";
import Participant from "../models/Participant.js";
import Conference from "../models/Conference.js";
import cloudinary from "../config/cloudinary.js";

// Helper: upload buffer to Cloudinary or save locally as fallback
const saveUploadedFile = async (file, folder = "posters") => {
  if (!file) return "";

  // Try Cloudinary if config is present
  if (process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_CLOUD_NAME) {
    try {
      return await new Promise((resolve, reject) => {
        const ext = path.extname(file.originalname).replace(".", "");
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: `regxpert/${folder}`,
            resource_type: "auto",
            format: ext || "jpg",
            quality: "auto",
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        uploadStream.end(file.buffer);
      });
    } catch (err) {
      console.warn("Cloudinary upload failed, falling back to local storage:", err.message);
    }
  }

  // Fallback: Local storage
  try {
    const uploadsDir = path.resolve(`./uploads/${folder}`);
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const ext = path.extname(file.originalname) || ".jpg";
    const filename = `${Date.now()}-${Math.floor(Math.random() * 1000000)}${ext}`;
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, file.buffer);
    return `/uploads/${folder}/${filename}`;
  } catch (err) {
    console.error("Local file save failed:", err);
    throw new Error("Failed to save uploaded file.");
  }
};

// Helper: delete local file if url points to local directory
const deleteLocalFile = (fileUrl) => {
  if (!fileUrl || !fileUrl.startsWith("/uploads/")) return;
  try {
    const filepath = path.resolve(`.${fileUrl}`);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
    }
  } catch (err) {
    console.error("Failed to delete local file:", fileUrl, err.message);
  }
};

// 1. Verify participant for the poster portal
export const verifyParticipant = async (req, res) => {
  try {
    const { slug, identifier } = req.body;
    if (!slug || !identifier) {
      return res.status(400).json({ error: "Missing slug or participant identifier." });
    }

    const conf = await Conference.findOne({ slug: slug.trim() });
    if (!conf) {
      return res.status(404).json({ error: "Conference not found." });
    }

    const cleanIdentifier = identifier.trim();

    // Query participant by email, regId, or phone
    const participant = await Participant.findOne({
      conferenceId: conf._id.toString(),
      $or: [
        { regId: { $regex: new RegExp(`^${cleanIdentifier}$`, "i") } },
        { email: { $regex: new RegExp(`^${cleanIdentifier}$`, "i") } },
        { phone: cleanIdentifier }
      ]
    });

    if (!participant) {
      return res.status(401).json({
        error: "Access denied. You are not a registered participant of this event."
      });
    }

    return res.status(200).json({
      success: true,
      participant: {
        _id: participant._id,
        regId: participant.regId,
        name: participant.name,
        email: participant.email,
        category: participant.category,
      },
      conference: {
        _id: conf._id,
        name: conf.name,
        slug: conf.slug,
        bannerImage: conf.bannerImage
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 2. Fetch list of posters for a conference (Attendee view)
export const getPosters = async (req, res) => {
  try {
    const { conferenceId } = req.params;
    if (!conferenceId) {
      return res.status(400).json({ error: "Missing conference identifier." });
    }

    // Resolve by ID or slug
    let confId = conferenceId;
    const targetConf = await Conference.findOne({
      $or: [
        { _id: mongoose.isValidObjectId(conferenceId) ? conferenceId : null },
        { slug: conferenceId }
      ].filter(Boolean)
    });

    if (targetConf) {
      confId = targetConf._id.toString();
    }

    const posters = await Poster.find({ conferenceId: confId }).sort({ posterNumber: 1 });
    return res.status(200).json(posters);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 3. Admin: Fetch all posters
export const adminGetPosters = async (req, res) => {
  try {
    const { conferenceId } = req.params;
    const posters = await Poster.find({ conferenceId }).sort({ posterNumber: 1 });
    return res.status(200).json(posters);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 4. Admin: Create a poster
export const adminCreatePoster = async (req, res) => {
  try {
    const {
      posterNumber,
      title,
      presenterName,
      coPresenters,
      institution,
      department,
      category,
      conferenceId
    } = req.body;

    if (!posterNumber || !title || !presenterName || !conferenceId) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const files = req.files || {};
    const posterFile = files.posterFile ? files.posterFile[0] : null;
    const thumbnailFile = files.thumbnailFile ? files.thumbnailFile[0] : null;

    if (!posterFile) {
      return res.status(400).json({ error: "Poster PDF or Image file is required." });
    }

    // Upload files
    const imageUrl = await saveUploadedFile(posterFile, "posters");
    
    // If thumbnail file is provided, upload it, otherwise reuse poster file URL (if it was an image) or default thumbnail
    let thumbnailUrl = "";
    if (thumbnailFile) {
      thumbnailUrl = await saveUploadedFile(thumbnailFile, "thumbnails");
    } else {
      thumbnailUrl = imageUrl;
    }

    const newPoster = new Poster({
      posterNumber,
      title,
      presenterName,
      coPresenters: coPresenters || "",
      institution: institution || "",
      department: department || "",
      category: category || "",
      imageUrl,
      thumbnailUrl,
      conferenceId
    });

    await newPoster.save();
    return res.status(201).json(newPoster);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 5. Admin: Edit poster details
export const adminEditPoster = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      posterNumber,
      title,
      presenterName,
      coPresenters,
      institution,
      department,
      category
    } = req.body;

    const poster = await Poster.findById(id);
    if (!poster) {
      return res.status(404).json({ error: "Poster not found." });
    }

    const files = req.files || {};
    const posterFile = files.posterFile ? files.posterFile[0] : null;
    const thumbnailFile = files.thumbnailFile ? files.thumbnailFile[0] : null;

    let imageUrl = poster.imageUrl;
    let thumbnailUrl = poster.thumbnailUrl;

    if (posterFile) {
      // Delete old file if local
      deleteLocalFile(poster.imageUrl);
      imageUrl = await saveUploadedFile(posterFile, "posters");
    }

    if (thumbnailFile) {
      deleteLocalFile(poster.thumbnailUrl);
      thumbnailUrl = await saveUploadedFile(thumbnailFile, "thumbnails");
    } else if (posterFile && !thumbnailFile && poster.thumbnailUrl === poster.imageUrl) {
      thumbnailUrl = imageUrl;
    }

    poster.posterNumber = posterNumber || poster.posterNumber;
    poster.title = title || poster.title;
    poster.presenterName = presenterName || poster.presenterName;
    poster.coPresenters = coPresenters !== undefined ? coPresenters : poster.coPresenters;
    poster.institution = institution !== undefined ? institution : poster.institution;
    poster.department = department !== undefined ? department : poster.department;
    poster.category = category !== undefined ? category : poster.category;
    poster.imageUrl = imageUrl;
    poster.thumbnailUrl = thumbnailUrl;

    await poster.save();
    return res.status(200).json(poster);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 6. Admin: Delete poster
export const adminDeletePoster = async (req, res) => {
  try {
    const { id } = req.params;
    const poster = await Poster.findById(id);
    if (!poster) {
      return res.status(404).json({ error: "Poster not found." });
    }

    // Clean up local media files if any
    deleteLocalFile(poster.imageUrl);
    deleteLocalFile(poster.thumbnailUrl);

    await Poster.findByIdAndDelete(id);
    return res.status(200).json({ success: true, message: "Poster deleted successfully." });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

// 7. Admin: Bulk upload posters
export const adminBulkUploadPosters = async (req, res) => {
  try {
    const { conferenceId, posters } = req.body;
    if (!conferenceId || !Array.isArray(posters)) {
      return res.status(400).json({ error: "Missing conferenceId or invalid posters array." });
    }

    const docs = posters.map(p => ({
      ...p,
      conferenceId,
      coPresenters: p.coPresenters || "",
      institution: p.institution || "",
      department: p.department || "",
      category: p.category || "",
      thumbnailUrl: p.thumbnailUrl || p.imageUrl,
    }));

    const result = await Poster.insertMany(docs);
    return res.status(201).json({ success: true, count: result.length });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
