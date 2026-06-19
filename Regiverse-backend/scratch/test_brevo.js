import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: path.join(__dirname, "../.env") });

const apiKey = process.env.BREVO_SMTP_KEY;
const senderEmail = process.env.BREVO_SENDER_EMAIL || process.env.BREVO_SMTP_USER;

console.log("BREVO_SMTP_KEY:", apiKey ? "FOUND (starts with " + apiKey.substring(0, 8) + "...)" : "MISSING");
console.log("BREVO_SENDER_EMAIL:", senderEmail);

if (!apiKey) {
  console.error("Missing BREVO_SMTP_KEY");
  process.exit(1);
}

async function testSend() {
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": apiKey,
        "content-type": "application/json",
        "accept": "application/json"
      },
      body: JSON.stringify({
        sender: {
          name: "Brevo Test",
          email: senderEmail
        },
        to: [
          {
            email: "sriyamini659@gmail.com",
            name: "Test Recipient"
          }
        ],
        subject: "Brevo API Test",
        htmlContent: "<h4>Brevo HTTP API test successful!</h4>"
      })
    });

    const status = response.status;
    const data = await response.json();
    console.log("HTTP Response Status:", status);
    console.log("Response Data:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Error in fetch:", err);
  }
}

testSend();
