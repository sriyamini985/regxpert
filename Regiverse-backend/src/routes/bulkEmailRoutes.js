import express from "express";
import QRCode from "qrcode";
import Participant from "../models/Participant.js";
import { Resend } from "resend";

const router = express.Router();

router.post("/:conferenceId/send-emails", async (req, res) => {
  try {
    if (!process.env.RESEND_API_KEY) {
      return res.status(500).json({ success: false, message: "Missing RESEND_API_KEY" });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const { subject, message } = req.body;

    const participants = await Participant.find({
      conferenceId: req.params.conferenceId,
    });

    if (!participants.length) {
      return res.status(404).json({ success: false, message: "No participants found" });
    }

    let sent = 0;
    let failed = 0;

    for (const p of participants) {
      try {
        if (!p.email || !p.email.includes("@")) {
          failed++;
          continue;
        }

        const qrDataUrl = await QRCode.toDataURL(p.regId || p._id.toString());

        // CHANGE THIS 'from' ADDRESS TO YOUR VERIFIED DOMAIN IN RESEND
        const response = await resend.emails.send({
          from: "RegiVerse <events@your-verified-domain.com>", 
          to: p.email,
          subject: subject || `Conference QR - ${p.conferenceName}`,
          html: `
            <div style="font-family:Arial;padding:20px;">
              <h2>Hello ${p.name}</h2>
              <p>${message || "Please find your conference QR code below."}</p>
              <div style="margin:25px 0;">
                <img src="${qrDataUrl}" width="220" alt="QR Code"/>
              </div>
              <p><b>Conference:</b> ${p.conferenceName}</p>
              <p>Please carry this QR during entry.</p>
            </div>
          `,
        });

        // Detailed logging for debugging
        if (response.error) {
          console.error(`RESEND ERROR for ${p.email}:`, response.error);
          failed++;
        } else {
          console.log(`EMAIL SENT to ${p.email}: ID ${response.data.id}`);
          sent++;
        }

      } catch (err) {
        console.error(`CRITICAL FAIL FOR ${p.email}:`, err.message);
        failed++;
      }
    }

    return res.json({ success: true, sent, failed });
  } catch (err) {
    console.error("ROUTE ERROR:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

export default router;