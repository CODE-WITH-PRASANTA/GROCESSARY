require("dotenv").config();
const nodemailer = require("nodemailer");

// ======================================================
// SMTP GMAIL CONFIGURATION
// ======================================================
const host = process.env.SMTP_HOST || "smtp.gmail.com";
const port = Number(process.env.SMTP_PORT) || 465;
const secure = process.env.SMTP_SECURE === "true" || port === 465;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;

const fromName = process.env.SMTP_FROM_NAME || "Art & Culture";
const fromEmail = process.env.SMTP_FROM_EMAIL || user;

if (!user || !pass) {
  console.warn("⚠️ SMTP credentials (SMTP_USER or SMTP_PASS) missing in .env");
}

// ======================================================
// NODEMAILER TRANSPORTER
// ======================================================
const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: {
    user,
    pass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify SMTP Connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Nodemailer verification error:", error.message);
  } else {
    console.log(`✅ Nodemailer connected successfully to ${host}:${port} (${user})`);
  }
});

// ======================================================
// SEND GENERIC EMAIL
// ======================================================
const sendMail = async ({ to, subject, html, text }) => {
  try {
    if (!to) {
      throw new Error("Recipient email address 'to' is required.");
    }

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      text: text || undefined,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Email sent successfully. MessageId:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error.message);
    throw error;
  }
};

// ======================================================
// SEND EMAIL OTP (Password Reset / Verification)
// ======================================================
const sendEmailOtp = async (email, otp) => {
  try {
    if (!email) {
      throw new Error("Recipient email is required to send OTP.");
    }

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: `${fromName} - Password Reset OTP Code`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>${fromName} OTP Verification</title>
          </head>
          <body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 30px 15px;">
              <tr>
                <td align="center">
                  <table role="presentation" width="100%" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.04);">
                    <!-- Header -->
                    <tr>
                      <td style="background-color: #102a27; padding: 24px 30px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px; font-weight: 800; color: #fbbd23; letter-spacing: -0.5px;">
                          ${fromName}
                        </h1>
                      </td>
                    </tr>
                    <!-- Body Content -->
                    <tr>
                      <td style="padding: 32px 30px 24px;">
                        <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #0f172a;">
                          Password Reset Request
                        </h2>
                        <p style="margin: 0 0 20px 0; font-size: 14.5px; line-height: 1.6; color: #475569;">
                          We received a request to reset your account password. Use the verification code below to complete the request:
                        </p>
                        <!-- OTP Box -->
                        <div style="text-align: center; margin: 28px 0; padding: 18px; background-color: #f1f5f9; border-radius: 12px; border: 1px dashed #cbd5e1;">
                          <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #102a27; font-family: monospace;">
                            ${otp}
                          </span>
                        </div>
                        <p style="margin: 0 0 14px 0; font-size: 13.5px; line-height: 1.5; color: #64748b;">
                          ⏱️ This OTP code is valid for <strong>10 minutes</strong>. Please do not share this code with anyone.
                        </p>
                        <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
                          If you did not initiate this request, you can safely ignore this email; your account remains secure.
                        </p>
                      </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                      <td style="background-color: #f8fafc; border-top: 1px solid #f1f5f9; padding: 16px 30px; text-align: center;">
                        <p style="margin: 0; font-size: 12px; color: #94a3b8;">
                          © ${new Date().getFullYear()} ${fromName}. All rights reserved.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
        </html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ OTP email sent successfully to", email, "MessageId:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Send OTP Error:", error.message);
    throw error;
  }
};

module.exports = {
  transporter,
  sendMail,
  sendEmailOtp,
};
