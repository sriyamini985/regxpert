import mongoose from "mongoose";

const emailLogSchema = new mongoose.Schema(
  {
    conferenceId: {
      type: String,
      required: true,
      index: true,
    },
    participantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Participant",
      index: true,
    },
    registrationId: {
      type: String,
      default: "",
    },
    recipientName: {
      type: String,
      default: "",
    },
    recipientEmail: {
      type: String,
      required: true,
      index: true,
    },
    campaignType: {
      type: String,
      enum: ["qr_pass", "general"],
      default: "qr_pass",
    },
    subject: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "sending", "sent", "failed"],
      default: "pending",
      index: true,
    },
    provider: {
      type: String,
      default: "brevo",
    },
    httpStatus: {
      type: Number,
    },
    messageId: {
      type: String,
    },
    failureReason: {
      type: String,
      default: "",
    },
    apiResponse: {
      type: String,
      default: "",
    },
    retryCount: {
      type: Number,
      default: 0,
    },
    sentAt: {
      type: Date,
    },
    failedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

emailLogSchema.index({ conferenceId: 1, status: 1 });
emailLogSchema.index({ conferenceId: 1, recipientEmail: 1 });

const EmailLog = mongoose.models.EmailLog || mongoose.model("EmailLog", emailLogSchema);

export default EmailLog;
