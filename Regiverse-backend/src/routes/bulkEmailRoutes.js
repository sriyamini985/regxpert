import express from "express";
import QRCode from "qrcode";
import Participant from "../models/Participant.js";
import { Resend } from "resend";

const router = express.Router();

const resend = new Resend(process.env.RESEND_API_KEY);

router.post("/:conferenceId/send-emails", async (req, res) => {
  try {
    const { subject, message } = req.body;

    const participants = await Participant.find({
      conferenceId: req.params.conferenceId,
    });

    if (!participants.length) {
      return res.status(404).json({
        success: false,
        message: "No participants found",
      });
    }

    let sent = 0;
    let failed = 0;

    for (const p of participants) {
      try {
        if (!p.email) {
          failed++;
          continue;
        }

        const qrDataUrl = await QRCode.toDataURL(
          p.regId || p._id.toString()
        );

        await resend.emails.send({
          from: "Conference <onboarding@resend.dev>",
          to: p.email,
          subject: subject || `QR Code - ${p.conferenceName}`,
          html: `
            <h2>Hello ${p.name}</h2>
            <p>${message || "Please find your QR code attached."}</p>
            <p><b>Conference:</b> ${p.conferenceName}</p>
            <p><b>Your QR Code:</b></p>
            <img src="${qrDataUrl}" width="200"/>
          `,
        });

        sent++;
      } catch (err) {
        console.log(`Failed for ${p.email}:`, err.message);
        failed++;
      }
    }

    return res.json({
      success: true,
      sent,
      failed,
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

export default router;