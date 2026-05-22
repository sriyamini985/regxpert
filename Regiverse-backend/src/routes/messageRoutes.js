import express from "express";

const router = express.Router();

/* =========================
   BULK EMAIL
========================= */

router.post(
  "/send-bulk-email",
  async (req, res) => {

    try {

      const {
        participants,
        subject,
        message,
      } = req.body;

      for (const p of participants) {

        console.log(
          "EMAIL:",
          p.email
        );

        console.log(
          "QR:",
          p.qrCode
        );

        /*
          SEND EMAIL HERE

          EMAIL SHOULD CONTAIN:

          - participant name
          - QR code
          - conference details
        */
      }

      res.json({
        success: true,
      });

    } catch (err) {

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

/* =========================
   BULK WHATSAPP
========================= */

router.post(
  "/send-bulk-whatsapp",
  async (req, res) => {

    try {

      const {
        participants,
        message,
      } = req.body;

      for (const p of participants) {

        console.log(
          "WHATSAPP:",
          p.phone
        );

        console.log(
          "QR:",
          p.qrCode
        );

        /*
          SEND WHATSAPP HERE

          SEND:
          - message
          - QR code
        */
      }

      res.json({
        success: true,
      });

    } catch (err) {

      res.status(500).json({
        success: false,
        message: err.message,
      });
    }
  }
);

export default router;