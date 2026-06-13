import express from "express";
import QRCode from "qrcode";
import Participant from "../models/Participant.js";
import { Resend } from "resend";

const router = express.Router();

router.post("/:conferenceId/send-emails", async (req, res) => {
  try {
    /* =========================
       CHECK RESEND KEY
    ========================= */

    if (!process.env.RESEND_API_KEY) {
      console.log("❌ RESEND_API_KEY MISSING");

      return res.status(500).json({
        success: false,
        message: "Missing RESEND_API_KEY",
      });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

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

    const query = { conferenceId: req.params.conferenceId };
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

        const response = await resend.emails.send({
          from: "RegXpert <onboarding@resend.dev>",

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
                    RegXpert
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

                    <p style="margin: 0 0 10px 0; color:#1e3a8a; font-size:14px;">
                      <b>Conference:</b>
                      ${p.conferenceName}
                    </p>

                    <p style="margin: 0; color:#1e3a8a; font-size:14px;">
                      <b>Registration ID:</b>
                      ${p.regId || p._id}
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

        console.log(
          "✅ RESEND RESPONSE:",
          JSON.stringify(response, null, 2)
        );

        if (response.error) {
          console.log("❌ RESEND ERROR:", response.error);

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