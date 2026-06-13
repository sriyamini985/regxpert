import express from "express";
import Participant from "../models/Participant.js";

const router = express.Router();

router.post("/:conferenceId/send", async (req, res) => {

  try {

    const { message, participantIds } = req.body;

    console.log(
      "CONFERENCE:",
      req.params.conferenceId
    );

    const query = { conferenceId: req.params.conferenceId };
    if (participantIds && Array.isArray(participantIds)) {
      query._id = { $in: participantIds };
    }

    const participants = await Participant.find(query);

    console.log(
      "TOTAL PARTICIPANTS:",
      participants.length
    );

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

        console.log(
          "CHECKING:",
          p.name,
          p.phone
        );

        if (!p.phone) {

          console.log("NO PHONE");

          failed++;
          continue;
        }

        console.log(`
==================================
SIMULATED WHATSAPP
TO: ${p.phone}

MESSAGE:
${message}

USER:
${p.name}
==================================
`);

        sent++;

      } catch (err) {

        console.log(err);

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