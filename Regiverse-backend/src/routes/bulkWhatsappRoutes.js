import express from "express";
import Participant from "../models/Participant.js";
import twilio from "twilio";

const router = express.Router();

router.post("/:conferenceId/send", async (req, res) => {
  try {
    const { message } = req.body;

    const participants = await Participant.find({
      conferenceId: req.params.conferenceId,
    });

    if (!participants.length) {
      return res.status(404).json({ success: false, message: "No participants found" });
    }

    let sent = 0;
    let failed = 0;

    // Initialize Twilio ONLY if credentials exist in .env
    const hasTwilio = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN;
    const client = hasTwilio ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN) : null;

    await Promise.all(
      participants.map(async (p) => {
        // Fallbacks in case your DB uses a different field name for the phone number
        const userPhone = p.phone || p.phoneNumber || p.contactNumber;

        if (!userPhone) {
          failed++;
          return;
        }

        // WhatsApp APIs require the country code (e.g., +91 for India, +1 for US)
        const formattedPhone = userPhone.toString().startsWith("+") ? userPhone : `+91${userPhone}`;
        
        // Note: WhatsApp APIs require public URLs for images. We send the ID as text.
        const customMessage = message || `Hello ${p.name},\nHere is your Registration ID for ${p.conferenceName}: ${p.regId || p._id}\nPlease show this at the entrance.`;

        try {
          if (client && process.env.TWILIO_WHATSAPP_NUMBER) {
            // Send real WhatsApp message
            await client.messages.create({
              body: customMessage,
              from: `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,
              to: `whatsapp:${formattedPhone}`,
            });
          } else {
            // Simulation mode if Twilio isn't set up yet
            console.log(`[SIMULATED WHATSAPP] To: ${formattedPhone} | Message: ${customMessage}`);
          }
          sent++;
        } catch (err) {
          console.error(`Failed to send WhatsApp to ${formattedPhone}:`, err.message);
          failed++;
        }
      })
    );

    res.json({ success: true, sent, failed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;