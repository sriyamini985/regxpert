import mongoose from "mongoose";

const badgeFieldSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { type: String, required: true }, // "name", "photo", "qr", "regId", "category", "city", "organization", "customText", etc.
  label: { type: String, default: "" },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  fontSize: { type: Number, default: 12 },
  fontWeight: { type: String, default: "normal" }, // "normal", "bold"
  fontStyle: { type: String, default: "normal" }, // "normal", "italic"
  fontFamily: { type: String, default: "system-ui" },
  color: { type: String, default: "#000000" },
  backgroundColor: { type: String, default: "transparent" },
  borderRadius: { type: Number, default: 0 },
  opacity: { type: Number, default: 1 },
  shadow: { type: String, default: "none" },
  alignment: { type: String, default: "left" }, // "left", "center", "right"
  rotation: { type: Number, default: 0 },
  letterSpacing: { type: String, default: "normal" },
  lineHeight: { type: String, default: "normal" },
  padding: { type: String, default: "0px" },
  
  // Specific settings for photo
  photoFit: { type: String, default: "cover" }, // "cover", "contain", "fill"
  circular: { type: Boolean, default: false },
  
  // Specific settings for QR
  qrErrorCorrection: { type: String, default: "L" },
  qrBgColor: { type: String, default: "#ffffff" },
  qrFgColor: { type: String, default: "#000000" }
});

const badgeTemplateSchema = new mongoose.Schema(
  {
    conferenceId: { type: String, required: true },
    name: { type: String, required: true }, // Template display name
    category: { type: String, required: true }, // Mapped participant category, or "Default"
    backgroundImage: { type: String, default: "" }, // Uploaded template background image filename/url
    canvasWidthMm: { type: Number, default: 86 },
    canvasHeightMm: { type: Number, default: 54 },
    isDefault: { type: Boolean, default: false },
    fields: [badgeFieldSchema]
  },
  { timestamps: true }
);

badgeTemplateSchema.index({ conferenceId: 1 });
badgeTemplateSchema.index({ category: 1 });

const BadgeTemplate = mongoose.models.BadgeTemplate || mongoose.model("BadgeTemplate", badgeTemplateSchema);
export default BadgeTemplate;
