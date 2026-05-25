import express from "express";
import QRCode from "qrcode";
import Participant from "../models/Participant.js";
import { Resend } from "resend";

const router = express.Router();

router.post("/:conferenceId/send-emails", async (req, res) => {

  try {

    /* =========================
       CHECK RESEND KEY
    ========================= */

    if (!process.env.RESEND_API_KEY) {

      console.log("❌ RESEND_API_KEY MISSING");

      return res.status(500).json({
        success: false,
        message: "Missing RESEND_API_KEY",
      });
    }

    const resend =
      new Resend(
        process.env.RESEND_API_KEY
      );

    const {
      subject,
      message,
    } = req.body;

    /* =========================
       GET PARTICIPANTS
    ========================= */

    const participants =
      await Participant.find({
        conferenceId:
          req.params.conferenceId,
      });

    console.log(
      "👥 TOTAL PARTICIPANTS:",
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

    /* =========================
       SEND EMAILS
    ========================= */

    for (const p of participants) {

      try {

        console.log(
          "📧 CHECKING:",
          p.name,
          p.email
        );

        /* VALIDATE EMAIL */

        if (
          !p.email ||
          !p.email.includes("@")
        ) {

          console.log(
            "❌ INVALID EMAIL:",
            p.email
          );

          failed++;
          continue;
        }

        /* GENERATE QR */

        const qrDataUrl =
          await QRCode.toDataURL(
            p.regId ||
            p._id.toString()
          );

        /* SEND EMAIL */

        const response =
          await resend.emails.send({

            from:
              "RegiVerse <onboarding@resend.dev>",

            to: p.email,

            subject:
              subject ||
              `Conference QR - ${p.conferenceName}`,

            html: `
              <div style="
                font-family:Arial;
                padding:20px;
                background:#f4f7fb;
              ">

                <div style="
                  max-width:600px;
                  margin:auto;
                  background:white;
                  padding:30px;
                  border-radius:16px;
                  box-shadow:0 4px 12px rgba(0,0,0,0.08);
                ">

                  <h1 style="
                    color:#2563eb;
                    margin-bottom:20px;
                  ">
                    RegiVerse
                  </h1>

                  <h2>
                    Hello ${p.name}
                  </h2>

                  <p style="
                    font-size:16px;
                    line-height:1.7;
                    color:#444;
                  ">
                    ${
                      message ||
                      "Please find your conference QR code below."
                    }
                  </p>

                  <div style="
                    text-align:center;
                    margin:30px 0;
                  ">

                    <img
                      src="${qrDataUrl}"
                      width="220"
                      alt="QR Code"
                    />

                  </div>

                  <div style="
                    background:#eff6ff;
                    padding:15px;
                    border-radius:12px;
                    margin-top:20px;
                  ">

                    <p>
                      <b>Conference:</b>
                      ${p.conferenceName}
                    </p>

                    <p>
                      <b>Registration ID:</b>
                      ${p.regId || p._id}
                    </p>

                  </div>

                  <p style="
                    margin-top:25px;
                    color:#666;
                    font-size:14px;
                  ">
                    Please carry this QR code
                    during conference entry.
                  </p>

                </div>

              </div>
            `,
          });

        /* =========================
           CHECK RESEND RESPONSE
        ========================= */

              console.log(
          JSON.stringify(response, null, 2)
        );

        if (response.error) {

          console.log(
            "❌ RESEND ERROR:",
            response.error
          );

          failed++;

        } else {

          console.log(
            "✅ EMAIL SENT:",
            p.email
          );

          sent++;
        }

      } catch (err) {

        console.log(
          "❌ FAILED FOR:",
          p.email
        );

        console.log(
          "ERROR:",
          err.message
        );

        failed++;
      }
    }

    /* =========================
       FINAL RESPONSE
    ========================= */

    return res.json({
      success: true,
      sent,
      failed,
    });

  } catch (err) {

    console.log(
      "❌ ROUTE ERROR:"
    );

    console.log(err);

    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
});

export default router;