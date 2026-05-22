import express from "express";
import Participant from "../models/Participant.js";

const router = express.Router();

/* =========================
   CREATE SINGLE PARTICIPANT
========================= */

router.post("/", async (req, res) => {

  try {

    const participant =
      await Participant.create({

        ...req.body,

        conferenceId:
          req.body.conferenceId || "",

        conferenceName:
          req.body.conferenceName || "",
      });

    res.json({
      success: true,
      data: participant,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* =========================
   GET ALL
========================= */

router.get("/", async (req, res) => {

  try {

    const data =
      await Participant.find().sort({
        createdAt: -1,
      });

    res.json(data);

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

/* =========================
   UPDATE
========================= */

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

    res.json({
      success: true,
      data: updated,
    });

  } catch (err) {

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});


/* =========================
   GET BY CONFERENCE
========================= */

router.get(
  "/conference/:conferenceId",
  async (req, res) => {

    try {

      const data =
        await Participant.find({
          conferenceId:
            req.params.conferenceId,
        }).sort({
          createdAt: -1,
        });

      res.json(data);

    } catch (err) {

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);


export default router;
