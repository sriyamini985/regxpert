import express from "express";
import QRCode from "qrcode";
import mongoose from "mongoose";
import Participant from "../models/Participant.js";
import Conference from "../models/Conference.js";
import { Resend } from "resend";
import fs from "fs/promises";

const router = express.Router();

router.post("/:conferenceId/send-emails", async (req, res) => {
  try {
    /* =========================
       CHECK RESEND KEY
    ========================= */

    const isMockMode = !process.env.RESEND_API_KEY;
    let resend = null;
    if (!isMockMode) {
      resend = new Resend(process.env.RESEND_API_KEY);
    } else {
      console.log("⚠️ RESEND_API_KEY IS MISSING. OPERATING IN MOCK MODE.");
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

        /* PREPARE ATTACHMENTS */

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

        let response;
        if (isMockMode) {
          // Mock email broadcasting: log and simulate success
          const mockLogEntry = {
            timestamp: new Date().toISOString(),
            from: `${p.conferenceName || "Conference"} <onboarding@resend.dev>`,
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
          response = { data: { id: `mock-id-${Date.now()}` }, error: null };
        } else {
          response = await resend.emails.send({
            from: `${p.conferenceName || "Conference"} <onboarding@resend.dev>`,

            to: p.email,

            subject:
              subject || `Conference QR - ${p.conferenceName}`,

            html: `
              <div style="font-family:Arial, sans-serif;padding:20px;background:#f4f7fb;">
                
                <div style="
                  max-width:600px;
                  margin:auto;
                  background:white;
                  border-radius:16px;
                  overflow:hidden;
                  box-shadow:0 4px 12px rgba(0,0,0,0.05);
                ">
                  ${bannerBuffer ? `
                    <div style="text-align:center; width:100%; max-height:240px; overflow:hidden; border-bottom:1px solid #eff2f6;">
                      <img src="cid:bannerImage" style="width:100%; max-width:100%; height:auto; display:block;" alt="Banner" />
                    </div>
                  ` : ''}

                  <div style="padding:30px;">
                    <h1 style="color:#2563eb; margin-top:0; font-size:24px; font-weight:800; tracking-tight:-0.025em;">
                      ${p.conferenceName || "Conference"}
                    </h1>

                    <h2 style="color:#1e293b; font-size:20px; font-weight:700; margin-top:20px;">
                      Hello ${p.name}
                    </h2>

                    <p style="
                      font-size:16px;
                      line-height:1.7;
                      color:#334155;
                    ">
                      ${
                        message ||
                        "Please find your conference QR code below."
                      }
                    </p>

                    <div style="
                      text-align:center;
                      margin:30px 0;
                    ">

                      <img
                        src="cid:qrcode"
                        width="220"
                        alt="QR Code"
                      />

                    </div>

                    <div style="
                      background:#f0f7ff;
                      padding:20px;
                      border-radius:12px;
                      border:1px solid #e0f2fe;
                    ">

                      <p style="margin: 0; color:#1e3a8a; font-size:14px;">
                        <b>Conference:</b>
                        ${p.conferenceName}
                      </p>

                    </div>

                    <p style="
                      margin-top:25px;
                      color:#64748b;
                      font-size:14px;
                      line-height:1.5;
                    ">
                      Please carry this QR code during conference entry.
                    </p>
                  </div>

                </div>

              </div>
            `,

            attachments: emailAttachments,
          });
        }

        console.log(
          "✅ EMAIL RESPONSE:",
          JSON.stringify(response, null, 2)
        );

        if (response.error) {
          console.log("❌ EMAIL SEND ERROR:", response.error);

          failed++;
        } else {
          console.log("✅ EMAIL SENT:", p.email);

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