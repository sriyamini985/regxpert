import express from "express";
import QRCode from "qrcode";
import mongoose from "mongoose";
import Participant from "../models/Participant.js";
import Conference from "../models/Conference.js";
import EmailLog from "../models/EmailLog.js";
import { 
  sendParticipantEmail, 
  generateQREmailHtml, 
  transmitViaBrevo 
} from "../services/emailService.js";
import { getIO } from "../socket.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// Permissive auth middleware that extracts user token if available without blocking requests
const authHandler = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    try {
      const token = authHeader.split(" ")[1];
      const jwtSecret = process.env.JWT_SECRET || "fallback_default_jwt_secret_key_123456";
      req.user = jwt.verify(token, jwtSecret);
    } catch (e) {
      // Allow progression in admin session
    }
  }
  next();
};

// In-memory campaign state tracker for live dashboard progress
const activeCampaigns = new Map();

/* ==========================================================
   PUBLIC GET ENDPOINT: DYNAMICALLY SERVE PARTICIPANT QR CODE
   ========================================================== */
router.get("/participant/:participantId/qrcode", async (req, res) => {
  try {
    const { participantId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(participantId)) {
      return res.status(400).send("Invalid participant ID");
    }

    const p = await Participant.findById(participantId);
    if (!p) {
      return res.status(404).send("Participant not found");
    }

    const qrCodeText = p.regId || p.qrCode || p._id.toString();
    const qrBuffer = await QRCode.toBuffer(qrCodeText, { width: 300, margin: 1 });

    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400");
    return res.send(qrBuffer);
  } catch (err) {
    console.error("❌ QR CODE GENERATION ERROR:", err.message);
    return res.status(500).send("Error generating QR code");
  }
});

/* ==========================================================
   PUBLIC GET ENDPOINT: DYNAMICALLY SERVE CONFERENCE CAMPAIGN BANNER
   ========================================================== */
router.get("/conference/:conferenceId/banner", async (req, res) => {
  try {
    const { conferenceId } = req.params;

    let conf = null;
    if (mongoose.Types.ObjectId.isValid(conferenceId)) {
      conf = await Conference.findById(conferenceId);
    } else {
      conf = await Conference.findOne({ slug: conferenceId });
    }

    if (!conf || !conf.bannerImage) {
      return res.status(404).send("Banner not found");
    }

    const base64Data = conf.bannerImage;
    if (base64Data.includes(";base64,")) {
      const parts = base64Data.split(";base64,");
      const mimeType = parts[0].split(":")[1] || "image/png";
      const buffer = Buffer.from(parts[1], "base64");
      res.setHeader("Content-Type", mimeType);
      return res.send(buffer);
    } else {
      const buffer = Buffer.from(base64Data, "base64");
      res.setHeader("Content-Type", "image/png");
      return res.send(buffer);
    }
  } catch (err) {
    console.error("❌ BANNER RETRIEVAL ERROR:", err.message);
    return res.status(500).send("Error retrieving banner");
  }
});

// Helper: Resolve Conference Document
const resolveConference = async (param) => {
  if (!param) return null;
  const clean = String(param).trim();
  let conf = null;
  if (mongoose.Types.ObjectId.isValid(clean)) {
    conf = await Conference.findById(clean).catch(() => null);
  }
  if (!conf) {
    conf = await Conference.findOne({
      $or: [{ slug: clean }, { name: clean }],
    }).catch(() => null);
  }
  return conf;
};

// Helper: Build Conference Query Conditions for Participants
const buildConferenceParticipantQuery = (param, targetConference) => {
  const conditions = [
    { conferenceId: param },
    { conferenceName: param },
  ];
  if (targetConference) {
    conditions.push({ conferenceId: targetConference._id.toString() });
    conditions.push({ conferenceName: targetConference.name });
    if (targetConference.slug) {
      conditions.push({ conferenceId: targetConference.slug });
    }
  }
  return { $or: conditions };
};

/* ==========================================================
   1. SEND ONE TEST EMAIL (With Complete Diagnostics)
   ========================================================== */
router.post("/:conferenceId/test-email", authHandler, async (req, res) => {
  try {
    const { testEmail, participantId } = req.body;
    const { conferenceId } = req.params;

    if (!testEmail || !testEmail.includes("@")) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid recipient test email address.",
      });
    }

    const targetConference = await resolveConference(conferenceId);
    const confName = targetConference?.name || "Dasara Navaratri 2026";
    const totalDays = targetConference?.totalDays || 9;

    let sampleParticipant = null;
    if (participantId && mongoose.Types.ObjectId.isValid(participantId)) {
      sampleParticipant = await Participant.findById(participantId);
    }
    if (!sampleParticipant) {
      sampleParticipant = await Participant.findOne({
        conferenceId: targetConference ? targetConference._id.toString() : conferenceId,
      });
    }

    const name = sampleParticipant?.name || "Admin Delegate";
    const regId = sampleParticipant?.regId || "DAS-TEST-001";
    const qrCodeText = sampleParticipant?.qrCode || regId;

    const baseUrl = `${req.protocol}://${req.headers.host}`;
    const bannerImageUrl = targetConference?.bannerImage
      ? `${baseUrl}/api/bulk-email/conference/${targetConference._id}/banner`
      : "";

    const htmlContent = await generateQREmailHtml({
      name,
      regId,
      conferenceName: confName,
      totalDays,
      qrCodeText,
      qrImageUrl: `${baseUrl}/api/bulk-email/participant/${sampleParticipant?._id || "preview"}/qrcode`,
      bannerImageUrl,
    });

    const subject = `Your Entry QR Code – ${confName}`;

    // Send single test email and capture full diagnostic result
    const result = await sendParticipantEmail({
      toEmail: testEmail.trim(),
      toName: name,
      subject,
      htmlContent,
      senderName: confName,
      senderEmail: process.env.BREVO_SENDER_EMAIL || "info@regxperts.com",
    });

    // Also run a dedicated direct Brevo diagnostic probe to report Brevo's direct status
    const directBrevo = await transmitViaBrevo({
      toEmail: testEmail.trim(),
      toName: name,
      subject,
      htmlContent,
      senderName: confName,
      senderEmail: process.env.BREVO_SENDER_EMAIL || "info@regxperts.com",
    });

    return res.json({
      success: result.success,
      recipient: testEmail.trim(),
      providerUsed: result.provider || "brevo",
      httpStatus: result.httpStatus,
      errorCode: result.errorCode || null,
      errorMessage: result.errorMessage || null,
      failureReason: result.failureReason || null,
      messageId: result.messageId || null,
      warning: result.warning || null,
      brevoDiagnostic: {
        httpStatus: directBrevo.httpStatus,
        errorCode: directBrevo.errorCode,
        errorMessage: directBrevo.errorMessage,
        failureReason: directBrevo.failureReason,
      },
    });
  } catch (err) {
    console.error("Test email error:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* ==========================================================
   2. PRE-SEND QR STATS ENDPOINT
   ========================================================== */
router.get("/:conferenceId/qr-stats", authHandler, async (req, res) => {
  try {
    const { conferenceId } = req.params;
    const targetConference = await resolveConference(conferenceId);
    const baseQuery = buildConferenceParticipantQuery(conferenceId, targetConference);

    const participants = await Participant.find(baseQuery);
    const totalRegistered = participants.length;

    let qrReady = 0;
    let alreadySent = 0;
    let pending = 0;
    let failed = 0;
    let noEmail = 0;

    participants.forEach((p) => {
      const hasEmail = p.email && p.email.includes("@") && p.email.includes(".");
      const hasQR = !!(p.qrCode || p.regId);

      if (hasQR) qrReady++;
      if (!hasEmail) {
        noEmail++;
      }

      if (p.qrEmailSent) {
        alreadySent++;
      } else if (p.qrEmailFailedAt) {
        failed++;
      } else if (hasEmail) {
        pending++;
      }
    });

    return res.json({
      success: true,
      stats: {
        totalRegistered,
        qrReady,
        alreadySent,
        pending,
        failed,
        noEmail,
      },
      conference: {
        id: targetConference?._id || conferenceId,
        name: targetConference?.name || "Dasara Navaratri 2026",
        totalDays: targetConference?.totalDays || 9,
      },
    });
  } catch (err) {
    console.error("QR Stats error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* ==========================================================
   2b. PREVIEW QR PASS EMAIL TEMPLATE
   ========================================================== */
router.get("/:conferenceId/preview-qr-email", authHandler, async (req, res) => {
  try {
    const { conferenceId } = req.params;
    const targetConference = await resolveConference(conferenceId);
    const confName = targetConference?.name || "Dasara Navaratri 2026";
    const totalDays = targetConference?.totalDays || 9;
    const baseUrl = `${req.protocol}://${req.headers.host}`;
    const bannerImageUrl = targetConference?.bannerImage
      ? `${baseUrl}/api/bulk-email/conference/${targetConference._id}/banner`
      : "";

    const html = await generateQREmailHtml({
      name: "Dr. Ramesh Sharma (Sample)",
      regId: "REG-2026-9001",
      conferenceName: confName,
      totalDays,
      qrCodeText: "REG-2026-9001",
      bannerImageUrl,
    });

    return res.json({ success: true, html });
  } catch (err) {
    console.error("Preview error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* ==========================================================
   3. SEND QR PASSES TO ALL / SELECTED / FAILED PARTICIPANTS
   ========================================================== */
router.post("/:conferenceId/send-qr-emails", authHandler, async (req, res) => {
  try {
    const { conferenceId } = req.params;
    const { participantIds, resendFailedOnly, forceResend } = req.body;

    const targetConference = await resolveConference(conferenceId);
    const confName = targetConference?.name || "Dasara Navaratri 2026";
    const totalDays = targetConference?.totalDays || 9;
    const finalConfId = targetConference ? targetConference._id.toString() : conferenceId;

    const baseQuery = buildConferenceParticipantQuery(conferenceId, targetConference);

    // Apply filters
    if (participantIds && Array.isArray(participantIds) && participantIds.length > 0) {
      baseQuery._id = { $in: participantIds };
    } else if (resendFailedOnly) {
      baseQuery.qrEmailFailedAt = { $exists: true };
      baseQuery.qrEmailSent = { $ne: true };
    } else if (!forceResend) {
      // Do not resend duplicate emails automatically
      baseQuery.qrEmailSent = { $ne: true };
    }

    const participants = await Participant.find(baseQuery);

    if (participants.length === 0) {
      return res.json({
        success: true,
        message: "No pending participants matched the campaign criteria.",
        total: 0,
        sent: 0,
        failed: 0,
        queued: false,
      });
    }

    const baseUrl = `${req.protocol}://${req.headers.host}`;
    const bannerImageUrl = targetConference?.bannerImage
      ? `${baseUrl}/api/bulk-email/conference/${targetConference._id}/banner`
      : "";

    // Initialize campaign state
    const campaignId = `campaign_${finalConfId}_${Date.now()}`;
    const campaignState = {
      campaignId,
      conferenceId: finalConfId,
      conferenceName: confName,
      total: participants.length,
      current: 0,
      sent: 0,
      failed: 0,
      remaining: participants.length,
      status: "running",
      startTime: new Date(),
      recentLogs: [],
    };
    activeCampaigns.set(finalConfId, campaignState);

    // Execute background worker
    const executeWorker = async () => {
      const io = getIO();

      for (let i = 0; i < participants.length; i++) {
        const p = participants[i];
        campaignState.current = i + 1;
        campaignState.remaining = participants.length - (i + 1);

        const email = (p.email || "").trim().toLowerCase();
        const hasValidEmail = email && email.includes("@") && email.includes(".");

        // Ensure QR code is generated on participant
        if (!p.qrCode || p.qrCode.trim() === "") {
          p.qrCode = p.regId || `QR-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
          await p.save();
        }

        // If email is missing or invalid: mark "Email Not Available" and continue
        if (!hasValidEmail) {
          const failureReason = "Email Not Available (Missing or invalid recipient address)";
          p.qrEmailFailedAt = new Date();
          p.qrEmailFailureReason = failureReason;
          await p.save();

          await EmailLog.create({
            conferenceId: finalConfId,
            participantId: p._id,
            registrationId: p.regId || "",
            recipientName: p.name || "",
            recipientEmail: p.email || "N/A",
            campaignType: "qr_pass",
            status: "failed",
            failureReason: failureReason,
            failedAt: new Date(),
          });

          campaignState.failed++;
          campaignState.recentLogs.unshift({
            recipient: p.name || "Unknown",
            email: p.email || "None",
            status: "failed",
            reason: failureReason,
          });

          if (io) {
            io.emit("email-campaign-progress", {
              ...campaignState,
              lastRecipient: p.name,
              lastEmail: p.email || "None",
              lastStatus: "failed",
              lastReason: failureReason,
            });
          }
          continue;
        }

        // Build HTML template
        try {
          const htmlContent = await generateQREmailHtml({
            name: p.name || "Delegate",
            regId: p.regId || "N/A",
            conferenceName: confName,
            totalDays,
            qrCodeText: p.qrCode || p.regId,
            qrImageUrl: `${baseUrl}/api/bulk-email/participant/${p._id}/qrcode`,
            bannerImageUrl,
          });

          const subject = `Your Entry QR Code – ${confName}`;

          const sendResult = await sendParticipantEmail({
            toEmail: email,
            toName: p.name || "Delegate",
            subject,
            htmlContent,
            senderName: confName,
            senderEmail: process.env.BREVO_SENDER_EMAIL || "info@regxperts.com",
          });

          if (sendResult.success) {
            p.qrEmailSent = true;
            p.qrEmailSentAt = new Date();
            p.qrEmailFailureReason = "";
            await p.save();

            await EmailLog.create({
              conferenceId: finalConfId,
              participantId: p._id,
              registrationId: p.regId || "",
              recipientName: p.name || "",
              recipientEmail: email,
              campaignType: "qr_pass",
              subject,
              status: "sent",
              provider: sendResult.provider,
              httpStatus: sendResult.httpStatus,
              messageId: sendResult.messageId,
              sentAt: new Date(),
            });

            campaignState.sent++;
            campaignState.recentLogs.unshift({
              recipient: p.name,
              email: email,
              status: "sent",
              messageId: sendResult.messageId,
            });
          } else {
            p.qrEmailFailedAt = new Date();
            p.qrEmailFailureReason = sendResult.failureReason || sendResult.errorMessage;
            await p.save();

            await EmailLog.create({
              conferenceId: finalConfId,
              participantId: p._id,
              registrationId: p.regId || "",
              recipientName: p.name || "",
              recipientEmail: email,
              campaignType: "qr_pass",
              subject,
              status: "failed",
              httpStatus: sendResult.httpStatus,
              failureReason: sendResult.failureReason || sendResult.errorMessage,
              apiResponse: sendResult.apiResponse || "",
              failedAt: new Date(),
            });

            campaignState.failed++;
            campaignState.recentLogs.unshift({
              recipient: p.name,
              email: email,
              status: "failed",
              reason: sendResult.failureReason || sendResult.errorMessage,
            });
          }

          if (io) {
            io.emit("email-campaign-progress", {
              ...campaignState,
              lastRecipient: p.name,
              lastEmail: email,
              lastStatus: sendResult.success ? "sent" : "failed",
              lastReason: sendResult.failureReason || "",
            });
          }
        } catch (itemErr) {
          console.error(`Email error for ${p.name}:`, itemErr.message);
          campaignState.failed++;
        }

        // Throttle 100ms between calls
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      campaignState.status = "completed";
      campaignState.endTime = new Date();
      if (io) {
        io.emit("email-campaign-completed", campaignState);
      }
    };

    // If small set (<= 5), execute immediately so response has full results
    if (participants.length <= 5) {
      await executeWorker();
      return res.json({
        success: true,
        queued: false,
        total: campaignState.total,
        sent: campaignState.sent,
        failed: campaignState.failed,
        message: `Processed ${campaignState.total} emails (${campaignState.sent} sent, ${campaignState.failed} failed).`,
        logs: campaignState.recentLogs,
      });
    }

    // Launch worker in background for large sets
    executeWorker().catch((bgErr) => console.error("Campaign background error:", bgErr));

    return res.status(202).json({
      success: true,
      queued: true,
      campaignId,
      total: participants.length,
      message: `Sending QR Emails: Queued ${participants.length} emails in background.`,
    });
  } catch (err) {
    console.error("send-qr-emails route error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* ==========================================================
   4. CAMPAIGN STATUS / POLLING ENDPOINT
   ========================================================== */
router.get("/:conferenceId/campaign-status", authHandler, async (req, res) => {
  try {
    const { conferenceId } = req.params;
    const targetConference = await resolveConference(conferenceId);
    const finalConfId = targetConference ? targetConference._id.toString() : conferenceId;

    const state = activeCampaigns.get(finalConfId);
    if (state) {
      return res.json({ success: true, active: true, campaign: state });
    }

    // Otherwise fetch summary from EmailLog
    const [sentCount, failedCount, recentLogs] = await Promise.all([
      EmailLog.countDocuments({ conferenceId: finalConfId, status: "sent" }),
      EmailLog.countDocuments({ conferenceId: finalConfId, status: "failed" }),
      EmailLog.find({ conferenceId: finalConfId }).sort({ createdAt: -1 }).limit(10),
    ]);

    return res.json({
      success: true,
      active: false,
      summary: {
        sent: sentCount,
        failed: failedCount,
        recentLogs,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* ==========================================================
   5. EMAIL AUDIT LOGS ENDPOINT
   ========================================================== */
router.get("/:conferenceId/email-logs", authHandler, async (req, res) => {
  try {
    const { conferenceId } = req.params;
    const { status, limit = 50 } = req.query;

    const targetConference = await resolveConference(conferenceId);
    const finalConfId = targetConference ? targetConference._id.toString() : conferenceId;

    const query = { conferenceId: finalConfId };
    if (status && status !== "all") {
      query.status = status;
    }

    const logs = await EmailLog.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit) || 50);

    return res.json({ success: true, logs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

/* ==========================================================
   6. EXISTING GENERAL BULK EMAIL BROADCAST ROUTE
   ========================================================== */
router.post("/:conferenceId/send-emails", authHandler, async (req, res) => {
  try {
    const { subject, message, bannerImage, participantIds } = req.body;
    const { conferenceId } = req.params;

    const targetConference = await resolveConference(conferenceId);
    const confName = targetConference?.name || "Conference";
    const finalConfId = targetConference ? targetConference._id.toString() : conferenceId;

    // Save banner to database for the conference if provided
    if (bannerImage && targetConference) {
      targetConference.bannerImage = bannerImage;
      await targetConference.save();
    }

    const baseQuery = buildConferenceParticipantQuery(conferenceId, targetConference);
    if (participantIds && Array.isArray(participantIds)) {
      baseQuery._id = { $in: participantIds };
    }

    const participants = await Participant.find(baseQuery);
    if (!participants.length) {
      return res.status(404).json({
        success: false,
        message: "No participants found matching the criteria.",
      });
    }

    const baseUrl = `${req.protocol}://${req.headers.host}`;
    const bannerImageUrl = targetConference?.bannerImage
      ? `${baseUrl}/api/bulk-email/conference/${targetConference._id}/banner`
      : "";

    let sent = 0;
    let failed = 0;
    const failureLogs = [];

    for (const p of participants) {
      const email = (p.email || "").trim().toLowerCase();
      if (!email || !email.includes("@")) {
        failed++;
        failureLogs.push({ recipient: p.name, email: p.email, reason: "Invalid recipient email" });
        continue;
      }

      const htmlContent = `
        <div style="font-family:'Inter', Arial, sans-serif; padding:30px 15px; background-color:#0f0f12; color:#e4e4e7;">
          <div style="max-width:550px; margin:0 auto; background-color:#18181b; border-radius:20px; border:1px solid #27272a; padding:30px 25px;">
            <h1 style="color:#ffffff; font-size:22px; margin-bottom:15px;">${confName}</h1>
            ${bannerImageUrl ? `<img src="${bannerImageUrl}" style="width:100%; border-radius:12px; margin-bottom:20px;" alt="Banner"/>` : ''}
            <p style="font-size:15px; color:#d4d4d8; line-height:1.6;">${message || "Important announcement from the organizers."}</p>
          </div>
        </div>
      `;

      const result = await sendParticipantEmail({
        toEmail: email,
        toName: p.name,
        subject: subject || `Announcement - ${confName}`,
        htmlContent,
        senderName: confName,
        senderEmail: process.env.BREVO_SENDER_EMAIL || "info@regxperts.com",
      });

      if (result.success) {
        sent++;
      } else {
        failed++;
        failureLogs.push({
          recipient: p.name,
          email,
          reason: result.failureReason || result.errorMessage,
        });
      }
    }

    return res.json({
      success: true,
      sent,
      failed,
      queued: false,
      failures: failureLogs,
      message: `Campaign complete: ${sent} sent, ${failed} failed.`,
    });
  } catch (err) {
    console.error("General send-emails route error:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;