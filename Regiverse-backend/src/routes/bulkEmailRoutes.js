import express from "express";
import nodemailer from "nodemailer";
import QRCode from "qrcode";
import Participant from "../models/Participant.js";

const router = express.Router();

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

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let sent = 0;

    await Promise.all(
      participants.map(async (p) => {
        if (!p.email) return;

        const qrDataUrl = await QRCode.toDataURL(
          p.regId || p._id.toString()
        );

        const base64Data = qrDataUrl.replace(
          /^data:image\/png;base64,/,
          ""
        );

        const qrBuffer = Buffer.from(base64Data, "base64");

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: p.email,
          subject: subject || `QR Code - ${p.conferenceName}`,
          html: `
            <h2>Hello ${p.name}</h2>
            <p>${message || "Please find your QR code attached."}</p>
            <p><b>Conference:</b> ${p.conferenceName}</p>
          `,
          attachments: [
            {
              filename: `QR-${p.regId || p._id}.png`,
              content: qrBuffer,
              encoding: "base64",
            },
          ],
        });

        sent++;
      })
    );

    res.json({
      success: true,
      sent,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

export default router;