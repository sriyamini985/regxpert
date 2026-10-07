import QRCode from "qrcode";
import nodemailer from "nodemailer";

/* ==========================================================
   GENERATE EVENT QR EMAIL TEMPLATE
   ========================================================== */
export const generateQREmailHtml = async ({
  name,
  regId,
  conferenceName = "Dasara Navaratri 2026",
  totalDays = 9,
  qrCodeText,
  qrImageUrl,
  bannerImageUrl,
}) => {
  // Generate base64 data URL for QR code
  let qrDataUri = "";
  try {
    qrDataUri = await QRCode.toDataURL(qrCodeText || regId || "EVENT-PASS", {
      width: 260,
      margin: 1,
      color: {
        dark: "#0f172a",
        light: "#ffffff",
      },
    });
  } catch (err) {
    console.error("QR Code DataURI generation error:", err.message);
  }

  const qrSrc = qrDataUri || qrImageUrl;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Entry QR Code – ${conferenceName}</title>
</head>
<body style="margin:0; padding:0; background-color:#f1f5f9; font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f1f5f9; padding:24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px; background-color:#ffffff; border-radius:24px; overflow:hidden; box-shadow:0 12px 36px rgba(15,23,42,0.08); border:1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background:linear-gradient(135deg, #1e293b 0%, #0f172a 100%); padding:32px 28px; text-align:center;">
              <span style="display:inline-block; background-color:rgba(245,158,11,0.18); color:#f59e0b; border:1px solid rgba(245,158,11,0.35); padding:6px 16px; border-radius:999px; font-size:11px; font-weight:800; text-transform:uppercase; letter-spacing:0.08em; margin-bottom:14px;">
                ★ Official Event Entry Pass ★
              </span>
              <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:800; line-height:1.25; letter-spacing:-0.02em;">
                ${conferenceName}
              </h1>
              <p style="margin:8px 0 0 0; color:#94a3b8; font-size:13px; font-weight:600;">
                All-${totalDays}-Day Unified Access QR Pass
              </p>
            </td>
          </tr>

          ${bannerImageUrl ? `
          <!-- Optional Event Banner -->
          <tr>
            <td style="padding:0; text-align:center; background-color:#0f172a;">
              <img src="${bannerImageUrl}" alt="Event Banner" style="width:100%; max-height:200px; object-fit:cover; display:block;" />
            </td>
          </tr>
          ` : ''}

          <!-- Content Body -->
          <tr>
            <td style="padding:32px 28px 24px 28px;">
              <p style="margin:0 0 16px 0; font-size:16px; font-weight:700; color:#0f172a;">
                Namaste ${name || "Delegate"},
              </p>
              
              <p style="margin:0 0 24px 0; font-size:14px; line-height:1.65; color:#475569;">
                Your registration for <strong style="color:#0f172a;">${conferenceName}</strong> has been successfully confirmed. Please keep the QR code below ready for entry.
              </p>

              <!-- Delegate Summary Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#f8fafc; border:1px solid #e2e8f0; border-radius:16px; margin-bottom:28px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="font-size:13px;">
                      <tr>
                        <td style="padding:4px 0; color:#64748b; font-weight:600; width:38%;">Attendee Name:</td>
                        <td style="padding:4px 0; color:#0f172a; font-weight:800;">${name}</td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0; color:#64748b; font-weight:600;">Registration ID:</td>
                        <td style="padding:4px 0; color:#2563eb; font-weight:800; font-family:monospace; font-size:14px;">${regId}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- QR Code Card -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#ffffff; border:2px dashed #cbd5e1; border-radius:20px; text-align:center; margin-bottom:28px;">
                <tr>
                  <td align="center" style="padding:28px 20px;">
                    <div style="background-color:#f8fafc; display:inline-block; padding:14px; border-radius:18px; border:1px solid #e2e8f0; box-shadow:0 4px 12px rgba(15,23,42,0.06);">
                      <img src="${qrSrc}" width="220" height="220" alt="Entry QR Code" style="display:block; margin:0 auto; max-width:100%; height:auto;" />
                    </div>
                    <p style="margin:16px 0 4px 0; font-size:14px; font-weight:800; color:#0f172a; letter-spacing:0.02em;">
                      ${regId}
                    </p>
                    <p style="margin:0; font-size:12px; font-weight:700; color:#059669; text-transform:uppercase; letter-spacing:0.04em;">
                      ✓ Valid for all ${totalDays} days of the event
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Important Guidelines -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#fefce8; border:1px solid #fef08a; border-radius:16px; margin-bottom:24px;">
                <tr>
                  <td style="padding:18px 20px;">
                    <p style="margin:0 0 10px 0; font-size:13px; font-weight:800; color:#854d0e; text-transform:uppercase; letter-spacing:0.04em;">
                      📌 Important Entry Guidelines:
                    </p>
                    <ul style="margin:0; padding-left:18px; font-size:13px; line-height:1.6; color:#713f12;">
                      <li style="margin-bottom:4px;">Keep this QR available on your phone.</li>
                      <li style="margin-bottom:4px;">Present it at the entry scanning counter.</li>
                      <li>Do not share your QR with another person.</li>
                    </ul>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 4px 0; font-size:13px; color:#475569; line-height:1.6;">
                We look forward to welcoming you.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc; border-top:1px solid #e2e8f0; padding:24px; text-align:center;">
              <p style="margin:0 0 4px 0; font-size:13px; font-weight:800; color:#0f172a;">
                RegXpert
              </p>
              <p style="margin:0 0 12px 0; font-size:11px; font-weight:600; color:#64748b; text-transform:uppercase; letter-spacing:0.04em;">
                Conference Management Platform
              </p>
              <p style="margin:0; font-size:11px; color:#94a3b8;">
                © 2026 ${conferenceName}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/* ==========================================================
   TRANSMIT EMAIL VIA BREVO HTTP API
   ========================================================== */
export const transmitViaBrevo = async ({
  toEmail,
  toName,
  subject,
  htmlContent,
  senderName = "RegXpert",
  senderEmail = process.env.BREVO_SENDER_EMAIL || "info@regxperts.com",
}) => {
  const apiKey = (process.env.BREVO_API_KEY || process.env.BREVO_SMTP_KEY || "").trim();

  if (!apiKey) {
    return {
      success: false,
      httpStatus: 500,
      errorCode: "MISSING_API_KEY",
      errorMessage: "Brevo API key is not configured in server environment variables.",
      failureReason: "Server is missing BREVO_API_KEY or BREVO_SMTP_KEY.",
    };
  }

  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify({
        sender: {
          name: senderName,
          email: senderEmail,
        },
        to: [
          {
            email: toEmail,
            name: toName || toEmail,
          },
        ],
        subject: subject,
        htmlContent: htmlContent,
      }),
    });

    const resData = await res.json().catch(() => ({}));

    if (res.ok) {
      return {
        success: true,
        httpStatus: res.status,
        messageId: resData.messageId,
        provider: "brevo",
        apiResponse: JSON.stringify(resData),
      };
    } else {
      const errCode = resData.code || `HTTP_${res.status}`;
      const errMsg = resData.message || resData.error || res.statusText || "Brevo API request failed";

      let failureReason = errMsg;
      if (res.status === 401 && errMsg.includes("not enabled")) {
        failureReason = "Brevo API Key is disabled or unactivated on your Brevo account dashboard.";
      } else if (res.status === 401) {
        failureReason = "Brevo authentication failed (Invalid API key or unauthorized).";
      } else if (res.status === 400 && errMsg.includes("sender")) {
        failureReason = `Sender email "${senderEmail}" is not verified in your Brevo account.`;
      }

      return {
        success: false,
        httpStatus: res.status,
        errorCode: errCode,
        errorMessage: errMsg,
        failureReason: failureReason,
        apiResponse: JSON.stringify(resData),
      };
    }
  } catch (err) {
    return {
      success: false,
      httpStatus: 0,
      errorCode: "NETWORK_ERROR",
      errorMessage: err.message,
      failureReason: `Network error connecting to Brevo API: ${err.message}`,
    };
  }
};

/* ==========================================================
   TRANSMIT VIA RESEND (FALLBACK PROVIDER IF CONFIGURED)
   ========================================================== */
export const transmitViaResend = async ({
  toEmail,
  subject,
  htmlContent,
  senderName = "RegXpert",
}) => {
  const resendKey = (process.env.RESEND_API_KEY || "").trim();
  if (!resendKey) {
    return {
      success: false,
      httpStatus: 500,
      errorCode: "MISSING_RESEND_KEY",
      errorMessage: "Resend API key is not configured.",
      failureReason: "Server missing RESEND_API_KEY.",
    };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `${senderName} <noreply@asstg.in>`,
        to: [toEmail],
        subject: subject,
        html: htmlContent,
      }),
    });

    const resData = await res.json().catch(() => ({}));
    if (res.ok) {
      return {
        success: true,
        httpStatus: res.status,
        messageId: resData.id,
        provider: "resend",
        apiResponse: JSON.stringify(resData),
      };
    } else {
      return {
        success: false,
        httpStatus: res.status,
        errorCode: resData.name || `HTTP_${res.status}`,
        errorMessage: resData.message || "Resend request failed",
        failureReason: resData.message || "Resend delivery failed",
        apiResponse: JSON.stringify(resData),
      };
    }
  } catch (err) {
    return {
      success: false,
      httpStatus: 0,
      errorCode: "NETWORK_ERROR",
      errorMessage: err.message,
      failureReason: `Resend network error: ${err.message}`,
    };
  }
};

/* ==========================================================
   TRANSMIT EMAIL WITH SMART RESILIENCE
   Tries Brevo first. If Brevo fails and Resend is available,
   records the Brevo diagnosis while enabling delivery.
   ========================================================== */
export const sendParticipantEmail = async ({
  toEmail,
  toName,
  subject,
  htmlContent,
  senderName,
  senderEmail,
}) => {
  // Validate recipient email syntax
  if (!toEmail || !toEmail.includes("@") || !toEmail.includes(".")) {
    return {
      success: false,
      httpStatus: 400,
      errorCode: "INVALID_RECIPIENT",
      errorMessage: `Invalid recipient email format: "${toEmail || ""}"`,
      failureReason: "Recipient email is invalid or missing.",
    };
  }

  // 1. Try Brevo (Primary Provider)
  const brevoResult = await transmitViaBrevo({
    toEmail,
    toName,
    subject,
    htmlContent,
    senderName,
    senderEmail,
  });

  if (brevoResult.success) {
    return brevoResult;
  }

  // 2. If Brevo failed and Resend is configured, attempt fallback to guarantee delivery
  if (process.env.RESEND_API_KEY) {
    console.warn(`⚠️ Brevo failed (${brevoResult.errorCode}: ${brevoResult.errorMessage}). Attempting Resend fallback...`);
    const resendResult = await transmitViaResend({
      toEmail,
      subject,
      htmlContent,
      senderName,
    });

    if (resendResult.success) {
      return {
        ...resendResult,
        warning: `Delivered via Resend fallback because Brevo returned: ${brevoResult.failureReason}`,
      };
    }
  }

  // Return the primary Brevo diagnostic failure
  return brevoResult;
};
