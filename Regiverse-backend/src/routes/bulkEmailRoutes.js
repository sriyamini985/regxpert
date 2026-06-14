import express from "express";
import QRCode from "qrcode";
import mongoose from "mongoose";
import Participant from "../models/Participant.js";
import Conference from "../models/Conference.js";
import fs from "fs/promises";

const router = express.Router();

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

    const qrCodeText = p.regId || p._id.toString();
    const qrBuffer = await QRCode.toBuffer(qrCodeText, { width: 300 });

    res.setHeader("Content-Type", "image/png");
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

/* ==========================================================
   POST ENDPOINT: SEND BULK EMAILS VIA BREVO TRANSACTIONAL HTTP API
   ========================================================== */
router.post("/:conferenceId/send-emails", async (req, res) => {
  try {
    const { subject, message, bannerImage, participantIds } = req.body;
    const param = req.params.conferenceId?.trim();

    /* =========================
       CHECK BREVO API KEYS
    ========================= */
    const apiKey = process.env.BREVO_SMTP_KEY; // The API key/SMTP key is the same
    const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.BREVO_SMTP_USER; // Use the verified sender email
    const isMockMode = !apiKey || !senderEmail;

    if (isMockMode) {
      console.log("⚠️ BREVO_SMTP_KEY or BREVO_SMTP_USER IS MISSING. OPERATING IN MOCK MODE.");
    }

    /* =========================
       GET CONFERENCES & PARTICIPANTS
    ========================= */
    const queryConditions = [
      { conferenceId: param },
      { conferenceName: param }
    ];

    const targetConference = await Conference.findOne({
      $or: [
        { slug: param },
        { name: param }
      ]
    }).catch(() => null);

    if (targetConference) {
      queryConditions.push({ conferenceId: targetConference._id.toString() });
      queryConditions.push({ conferenceName: targetConference.name });
    }

    if (mongoose.Types.ObjectId.isValid(param)) {
      const targetByObjId = await Conference.findById(param).catch(() => null);
      if (targetByObjId) {
        queryConditions.push({ conferenceId: targetByObjId._id.toString() });
        queryConditions.push({ conferenceName: targetByObjId.name });
        if (targetByObjId.slug) {
          queryConditions.push({ conferenceId: targetByObjId.slug });
        }
      }
    }

    // Save banner to database for the conference if provided
    if (bannerImage && targetConference) {
      targetConference.bannerImage = bannerImage;
      await targetConference.save();
    }

    const query = {
      $or: queryConditions
    };

    if (participantIds && Array.isArray(participantIds)) {
      query._id = { $in: participantIds };
    }

    const participants = await Participant.find(query);

    console.log("👥 TOTAL PARTICIPANTS:", participants.length);

    if (!participants.length) {
      return res.status(404).json({
        success: false,
        message: "No participants found",
      });
    }

    // Get base URL for absolute image links
    const baseUrl = `${req.protocol}://${req.headers.host}`;

    let sent = 0;
    let failed = 0;

    /* =========================
       SEND EMAILS
    ========================= */
    for (const p of participants) {
      try {
        console.log("📧 CHECKING:", p.name, p.email);

        /* VALIDATE EMAIL */
        if (!p.email || !p.email.includes("@")) {
          console.log("❌ INVALID EMAIL:", p.email);
          failed++;
          continue;
        }

        const html = `
          <div style="font-family:'Inter', Arial, sans-serif; padding:30px 15px; background-color:#0f0f12; color:#e4e4e7; min-height:100%;">
            
            <div style="
              max-width:550px;
              margin:0 auto;
              background-color:#18181b;
              border-radius:20px;
              overflow:hidden;
              border:1px solid #27272a;
              box-shadow:0 10px 30px rgba(0,0,0,0.3);
            ">
              
              <!-- Header Banner -->
              <div style="background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%); padding:35px 20px; text-align:center; border-bottom:1px solid #27272a;">
                <span style="background-color:rgba(255,255,255,0.15); color:#ffffff; padding:6px 16px; border-radius:50px; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.05em; display:inline-block; margin-bottom:15px; border:1px solid rgba(255,255,255,0.25);">
                  ✓ Registration Confirmed
                </span>
                <h1 style="color:#ffffff; margin:0; font-size:24px; font-weight:800; line-height:1.2; letter-spacing:-0.02em;">
                  ${p.conferenceName || "Conference"}
                </h1>
              </div>

              <!-- Optional Campaign Banner -->
              ${bannerImage && targetConference ? `
                <div style="text-align:center; width:100%; max-height:240px; overflow:hidden; border-bottom:1px solid #27272a;">
                  <img src="${baseUrl}/api/bulk-email/conference/${targetConference._id}/banner" style="width:100%; max-width:100%; height:auto; display:block;" alt="Event Banner" />
                </div>
              ` : ''}

              <!-- Body -->
              <div style="padding:30px 25px;">
                <p style="font-size:16px; color:#a1a1aa; margin:0 0 15px 0; line-height:1.6;">
                  Hi <strong style="color:#ffffff;">${p.name}</strong>,
                </p>
                <p style="font-size:15px; color:#d4d4d8; margin:0 0 30px 0; line-height:1.6;">
                  ${
                    message ||
                    "Thank you for registering! Your spot has been reserved. Here are your event pass and details:"
                  }
                </p>

                <!-- QR Code Section -->
                <div style="background-color:#121214; border-radius:16px; border:1px solid #27272a; padding:25px; text-align:center; margin-bottom:30px;">
                  <span style="color:#818cf8; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.1em; display:block; margin-bottom:15px;">
                    Your Event Pass QR Code
                  </span>
                  <div style="display:inline-block; background-color:#ffffff; padding:15px; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.25);">
                    <img src="${baseUrl}/api/bulk-email/participant/${p._id}/qrcode" width="200" height="200" style="display:block;" alt="QR Code" />
                  </div>
                  <span style="color:#71717a; font-size:12px; display:block; margin-top:15px; font-weight:500;">
                    Scan this QR code at the event venue
                  </span>
                </div>

                <!-- Attendee Info Card -->
                <div style="background-color:#121214; border-radius:16px; border:1px solid #27272a; overflow:hidden; margin-bottom:30px;">
                  <div style="border-bottom:1px solid #27272a; padding:12px 20px; background-color:rgba(255,255,255,0.02);">
                    <span style="color:#a1a1aa; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.1em;">
                      Attendee Information
                    </span>
                  </div>
                  <div style="padding:15px 20px;">
                    <table style="width:100%; border-collapse:collapse; font-size:14px; color:#d4d4d8;">
                      <tr>
                        <td style="padding:8px 0; color:#71717a; width:35%; font-weight:600;">Name</td>
                        <td style="padding:8px 0; color:#ffffff; font-weight:700;">${p.name}</td>
                      </tr>
                      <tr>
                        <td style="padding:8px 0; color:#71717a; font-weight:600; border-top:1px solid #27272a;">Email</td>
                        <td style="padding:8px 0; color:#ffffff; font-weight:600; border-top:1px solid #27272a; word-break:break-all;">${p.email}</td>
                      </tr>
                      ${p.phone ? `
                      <tr>
                        <td style="padding:8px 0; color:#71717a; font-weight:600; border-top:1px solid #27272a;">Mobile</td>
                        <td style="padding:8px 0; color:#ffffff; font-weight:600; border-top:1px solid #27272a;">${p.phone}</td>
                      </tr>
                      ` : ''}
                      ${p.category ? `
                      <tr>
                        <td style="padding:8px 0; color:#71717a; font-weight:600; border-top:1px solid #27272a;">Category</td>
                        <td style="padding:8px 0; color:#ffffff; font-weight:600; border-top:1px solid #27272a;">${p.category}</td>
                      </tr>
                      ` : ''}
                    </table>
                  </div>
                </div>

              </div>

              <!-- Footer -->
              <div style="background-color:#121214; padding:25px; text-align:center; border-top:1px solid #27272a;">
                <p style="margin:0 0 8px 0; color:#e4e4e7; font-size:13px; font-weight:700;">
                  ${p.conferenceName || "Conference"}
                </p>
                <p style="margin:0 0 15px 0; color:#71717a; font-size:11px; font-weight:500;">
                  Event Registration Confirmation
                </p>
                <p style="margin:0; color:#52525b; font-size:11px; font-weight:400;">
                  © 2026 ${p.conferenceName || "Conference"}. All rights reserved.
                </p>
              </div>

            </div>
          </div>
        `;

        if (isMockMode) {
          // Mock email broadcasting: log and simulate success
          const mockLogEntry = {
            timestamp: new Date().toISOString(),
            from: `"${p.conferenceName || "Conference"}" <mock@brevo.com>`,
            to: p.email,
            subject: subject || `Conference QR - ${p.conferenceName}`,
            message: message || "Please find your conference QR code below.",
            qrCodeValue: p.regId || p._id.toString(),
            hasBanner: !!bannerImage,
          };

          try {
            let existingLogs = [];
            try {
              const fileData = await fs.readFile("mock-emails.json", "utf-8");
              existingLogs = JSON.parse(fileData);
            } catch (readErr) {
              // File not found or empty
            }
            existingLogs.push(mockLogEntry);
            await fs.writeFile("mock-emails.json", JSON.stringify(existingLogs, null, 2), "utf-8");
          } catch (writeErr) {
            console.log("❌ FAILED TO WRITE MOCK EMAIL TO FILE:", writeErr.message);
          }

          console.log(`📧 [MOCK EMAIL] Sent successfully to: ${p.email}`);
          sent++;
        } else {
          // Send via Brevo HTTP API (Port 443)
          const response = await fetch("https://api.brevo.com/v3/smtp/email", {
            method: "POST",
            headers: {
              "api-key": apiKey,
              "content-type": "application/json",
              "accept": "application/json"
            },
            body: JSON.stringify({
              sender: {
                name: p.conferenceName || "Conference",
                email: senderEmail
              },
              to: [
                {
                  email: p.email,
                  name: p.name
                }
              ],
              subject: subject || `Conference QR - ${p.conferenceName}`,
              htmlContent: html
            })
          });

          const resData = await response.json();

          if (response.ok) {
            console.log("✅ EMAIL SENT:", p.email, resData.messageId);
            sent++;
          } else {
            console.error("❌ BREVO API ERROR:", JSON.stringify(resData.error || resData));
            failed++;
          }
        }
      } catch (err) {
        console.log("❌ FAILED FOR:", p.email);
        console.log("ERROR:", err.message);
        failed++;
      }
    }

    /* =========================
       FINAL RESPONSE
    ========================= */
    return res.json({
      success: true,
      sent,
      failed,
    });
  } catch (err) {
    console.log("❌ ROUTE ERROR:");
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

export default router;