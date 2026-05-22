import express from "express";
import QRCode from "qrcode";
import Participant from "../models/Participant.js";

const router = express.Router();

router.post("/:conferenceId/send", async (req, res) => {
  try {
    const participants = await Participant.find({
      conferenceId: req.params.conferenceId,
    });

    let sent = 0;

    await Promise.all(
      participants.map(async (p) => {
        if (!p.phone) return;

        const qrDataUrl = await QRCode.toDataURL(
          p.regId || p._id.toString()
        );

        // NOTE: WhatsApp API needs hosted image in real production
        const message = `
Hello ${p.name},
Here is your QR code for ${p.conferenceName}.
        `;

        console.log("SEND TO:", p.phone);
        console.log("MESSAGE:", message);

        sent++;
      })
    );

    res.json({
      success: true,
      sent,
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

export default router;