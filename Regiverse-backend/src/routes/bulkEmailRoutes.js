import express from "express";
import QRCode from "qrcode";
import mongoose from "mongoose";
import Participant from "../models/Participant.js";
import Conference from "../models/Conference.js";
import nodemailer from "nodemailer";
import fs from "fs/promises";

const router = express.Router();

router.post("/:conferenceId/send-emails", async (req, res) => {
  try {
    /* =========================
       CHECK BREVO SMTP KEYS
    ========================= */

    const isMockMode = !process.env.BREVO_SMTP_KEY || !process.env.BREVO_SMTP_USER;
    let transporter = null;
    if (!isMockMode) {
      transporter = nodemailer.createTransport({
        host: "smtp-relay.brevo.com",
        port: 587,
        auth: {
          user: process.env.BREVO_SMTP_USER,
          pass: process.env.BREVO_SMTP_KEY,
        },
      });
    } else {
      console.log("⚠️ BREVO_SMTP_KEY or BREVO_SMTP_USER IS MISSING. OPERATING IN MOCK MODE.");
    }

    const { subject, message, bannerImage, participantIds } = req.body;

    /* =========================
       PARSE BANNER IMAGE
    ========================= */

    let bannerBuffer = null;
    let bannerMime = null;
    if (bannerImage && typeof bannerImage === "string" && bannerImage.includes(";base64合作")) {
      // Just in case there's an encoding typo, let's look for base64
    }
    if (bannerImage && typeof bannerImage === "string" && bannerImage.includes(";base64,")) {
      try {
        const parts = bannerImage.split(";base64,");
        const mimeType = parts[0].split(":")[1]; // e.g. "image/png"
        const base64Content = parts[1];
        bannerBuffer = Buffer.from(base64Content, "base64");
        bannerMime = mimeType;
      } catch (err) {
        console.log("❌ FAILED TO PARSE BASE64 BANNER:", err.message);
      }
    }

    /* =========================
       GET PARTICIPANTS
    ========================= */

    const param = req.params.conferenceId?.trim();
    
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

        /* GENERATE QR */

        const qrBuffer = await QRCode.toBuffer(
          p.regId || p._id.toString(),
          {
            width: 300,
          }
        );

        /* PREPARE ATTACHMENTS (for inline reference and download support) */

        const emailAttachments = [
          {
            filename: "qrcode.png",
            content: qrBuffer,
            cid: "qrcode",
          },
        ];

        if (bannerBuffer && bannerMime) {
          const ext = bannerMime.split("/")[1] || "png";
          emailAttachments.push({
            filename: `banner.${ext}`,
            content: bannerBuffer,
            cid: "bannerImage",
          });
        }

        /* SEND EMAIL */

        if (isMockMode) {
          // Mock email broadcasting: log and simulate success
          const mockLogEntry = {
            timestamp: new Date().toISOString(),
            from: `"${p.conferenceName || "Conference"}" <mock@brevo.com>`,
            to: p.email,
            subject: subject || `Conference QR - ${p.conferenceName}`,
            message: message || "Please find your conference QR code below.",
            qrCodeValue: p.regId || p._id.toString(),
            hasBanner: !!bannerBuffer,
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
          const info = await transporter.sendMail({
            from: `"${p.conferenceName || "Conference"}" <${process.env.BREVO_SMTP_USER}>`,
            to: p.email,
            subject: subject || `Conference QR - ${p.conferenceName}`,
            html: `
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
                  ${bannerBuffer && bannerMime ? `
                    <div style="text-align:center; width:100%; max-height:240px; overflow:hidden; border-bottom:1px solid #27272a;">
                      <img src="cid:bannerImage" style="width:100%; max-width:100%; height:auto; display:block;" alt="Event Banner" />
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
                        <img src="cid:qrcode" width="200" height="200" style="display:block;" alt="QR Code" />
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
            `,
            attachments: emailAttachments,
          });

          console.log("✅ EMAIL SENT:", p.email, info.messageId);
          sent++;
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