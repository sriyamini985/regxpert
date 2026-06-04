import express from "express";
import Participant from "../models/Participant.js";

import {
  broadcastParticipantCreated,
  broadcastParticipantUpdated,
  broadcastParticipantDeleted,
} from "../socket.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const participant =
      await Participant.create(
        req.body
      );

    broadcastParticipantCreated(
      participant
    );

    return res.json({
      success: true,
      data: participant,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const participants =
      await Participant.find().sort({
        createdAt: -1,
      });

    return res.json(participants);
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const updated =
      await Participant.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
        }
      );

    broadcastParticipantUpdated(
      updated
    );

    return res.json({
      success: true,
      data: updated,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Participant.findByIdAndDelete(
      req.params.id
    );

    broadcastParticipantDeleted(
      req.params.id
    );

    return res.json({
      success: true,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

router.get(
  "/conference/:conferenceId",
  async (req, res) => {
    try {
      const conferenceId =
        req.params.conferenceId;

      const participants =
        await Participant.find({
          $or: [
            {
              conferenceId,
            },
            {
              conferenceName:
                conferenceId,
            },
          ],
        }).sort({
          createdAt: -1,
        });

      return res.json(
        participants
      );
    } catch (err) {
      return res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

export default router;