import express from "express";
import mongoose from "mongoose";
import Participant from "../models/Participant.js";
import Conference from "../models/Conference.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Helper to format phone numbers for Meta Cloud API (requires international code without "+" or leading "0")
function formatPhoneForMeta(phone) {
  let cleaned = phone.toString().replace(/\D/g, "");
  
  // Default to India (+91) if it's a 10-digit number
  if (cleaned.length === 10) {
    cleaned = "91" + cleaned;
  }
  // Remove leading 0 and prepend country code 91 if it's 11 digits starting with 0
  else if (cleaned.length === 11 && cleaned.startsWith("0")) {
    cleaned = "91" + cleaned.substring(1);
  }
  
  return cleaned;
}

// Helper function to send WhatsApp for a single participant
const sendWhatsappForParticipant = async (p, message, isMockMode, accessToken, phoneNumberId) => {
  try {
    if (!p.phone) {
      console.log(`❌ NO PHONE NUMBER FOR PARTICIPANT: ${p.name}`);
      return false;
    }

    const formattedPhone = formatPhoneForMeta(p.phone);

    if (isMockMode) {
      console.log(`
==================================
[MOCK WHATSAPP]
TO: ${formattedPhone} (Original: ${p.phone})
MESSAGE:
${message}
USER: ${p.name}
==================================
`);
      return true;
    } else {
      // Call Meta WhatsApp Cloud API
      const response = await fetch(
        `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            recipient_type: "individual",
            to: formattedPhone,
            type: "text",
            text: {
              preview_url: false,
              body: message,
            },
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        console.log(`✅ WHATSAPP SENT TO ${p.name} (${formattedPhone}):`, data.messages?.[0]?.id);
        return true;
      } else {
        console.error(`❌ WHATSAPP ERROR FOR ${p.name} (${formattedPhone}):`, JSON.stringify(data.error || data));
        return false;
      }
    }
  } catch (err) {
    console.error(`❌ FAILED TO SEND WHATSAPP FOR ${p.name}:`, err.message);
    return false;
  }
};

router.post("/:conferenceId/send", requireAuth, async (req, res) => {
  try {
    const { message, participantIds } = req.body;
    const param = req.params.conferenceId?.trim();

    /* =========================
       CHECK META CLOUD API KEYS
    ========================= */
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const isMockMode = !accessToken || !phoneNumberId;

    if (isMockMode) {
      console.log("⚠️ WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID is missing. OPERATING IN MOCK MODE.");
    }

    /* =========================
       GET PARTICIPANTS
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

    const query = {
      $or: queryConditions
    };

    if (participantIds && Array.isArray(participantIds)) {
      query._id = { $in: participantIds };
    }

    const participants = await Participant.find(query);

    console.log("👥 TOTAL WHATSAPP RECIPIENTS:", participants.length);

    if (!participants.length) {
      return res.status(404).json({
        success: false,
        message: "No participants found",
      });
    }

    // --- DUAL PATH NON-BLOCKING IMPLEMENTATION ---
    if (participants.length > 30) {
      // Background Mode: return 202 Accepted immediately to avoid reverse-proxy timeouts
      res.status(202).json({
        success: true,
        sent: participants.length,
        failed: 0,
        queued: true,
        message: `Campaign queued in background for ${participants.length} recipients.`
      });

      // Execute loop asynchronously in the background
      (async () => {
        for (const p of participants) {
          try {
            await sendWhatsappForParticipant(p, message, isMockMode, accessToken, phoneNumberId);
            // Yield control back to event loop with a 50ms delay between pings to avoid event loop starvation
            await new Promise(resolve => setTimeout(resolve, 50));
          } catch (bgErr) {
            console.error(`❌ Background WhatsApp campaign execution failed for participant ${p._id}:`, bgErr.message);
          }
        }
      })();
    } else {
      // Synchronous Mode: send and wait to return exact stats for small participant sets
      let sent = 0;
      let failed = 0;
      for (const p of participants) {
        const success = await sendWhatsappForParticipant(p, message, isMockMode, accessToken, phoneNumberId);
        if (success) sent++;
        else failed++;
      }

      return res.json({
        success: true,
        sent,
        failed,
        queued: false
      });
    }
  } catch (err) {
    console.error("❌ WHATSAPP ROUTE ERROR:", err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

export default router;