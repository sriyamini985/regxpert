import express from "express";
import Participant from "../models/Participant.js";
import twilio from "twilio";

const router = express.Router();

router.post("/:conferenceId/send", async (req, res) => {

  try {

    const { message } = req.body;

    const participants =
      await Participant.find({
        conferenceId:
          req.params.conferenceId,
      });

    console.log(
      "TOTAL PARTICIPANTS:",
      participants.length
    );

    let sent = 0;
    let failed = 0;

    const hasTwilio =
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_WHATSAPP_NUMBER;

    let client = null;

    if (hasTwilio) {

      client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      console.log(
        "TWILIO MODE ENABLED"
      );

    } else {

      console.log(
        "SIMULATION MODE"
      );
    }

    for (const p of participants) {

      try {

        console.log(
          "PHONE CHECK:",
          p.name,
          p.phone
        );

        if (!p.phone) {

          console.log(
            "NO PHONE FOUND"
          );

          failed++;
          continue;
        }

        const formattedPhone =
          p.phone.startsWith("+")
            ? p.phone
            : `+91${p.phone}`;

        const finalMessage =
          message ||
          `Hello ${p.name},
Your registration for ${p.conferenceName} is confirmed.`;

        if (client) {

          await client.messages.create({

            body: finalMessage,

            from:
              `whatsapp:${process.env.TWILIO_WHATSAPP_NUMBER}`,

            to:
              `whatsapp:${formattedPhone}`,
          });

          console.log(
            "WHATSAPP SENT:",
            formattedPhone
          );

        } else {

          console.log(`
SIMULATED WHATSAPP
TO: ${formattedPhone}

MESSAGE:
${finalMessage}
          `);
        }

        sent++;

      } catch (err) {

        console.log(
          "WHATSAPP FAILED:",
          err.message
        );

        failed++;
      }
    }

    res.json({
      success: true,
      sent,
      failed,
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