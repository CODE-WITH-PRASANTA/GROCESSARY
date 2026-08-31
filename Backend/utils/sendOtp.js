require("dotenv").config();

const nodemailer = require("nodemailer");

// ======================================================
// CHECK ENV
// ======================================================

console.log(
  "Nodemailer EMAIL_USER:",
  process.env.EMAIL_USER
);

console.log(
  "Nodemailer EMAIL_PASSWORD:",
  process.env.EMAIL_PASSWORD
    ? "LOADED"
    : "MISSING"
);

// ======================================================
// TRANSPORTER
// ======================================================

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// ======================================================
// VERIFY SMTP
// ======================================================

transporter.verify((error, success) => {
  if (error) {
    console.error(
      "Nodemailer verification error:",
      error
    );
  } else {
    console.log(
      "Nodemailer Gmail connection successful."
    );
  }
});

// ======================================================
// SEND EMAIL OTP
// ======================================================

const sendEmailOtp = async (email, otp) => {
  try {
    if (!process.env.EMAIL_USER) {
      throw new Error(
        "EMAIL_USER is missing."
      );
    }

    if (!process.env.EMAIL_PASSWORD) {
      throw new Error(
        "EMAIL_PASSWORD is missing."
      );
    }

    const mailOptions = {
      from: `"Grocery Sathi" <${process.env.EMAIL_USER}>`,

      to: email,

      subject:
        "Grocery Sathi Password Reset OTP",

      html: `
        <!DOCTYPE html>

        <html>
          <head>
            <meta charset="UTF-8" />

            <title>
              Grocery Sathi OTP
            </title>
          </head>

          <body
            style="
              margin:0;
              padding:0;
              background:#f5f5f5;
              font-family:Arial,sans-serif;
            "
          >

            <div
              style="
                max-width:600px;
                margin:40px auto;
                background:#ffffff;
                padding:30px;
                border-radius:12px;
                border:1px solid #eeeeee;
              "
            >

              <h2
                style="
                  margin-top:0;
                "
              >
                Grocery Sathi
              </h2>

              <p>
                You requested to reset your
                Grocery Sathi password.
              </p>

              <p>
                Your OTP is:
              </p>

              <div
                style="
                  text-align:center;
                  margin:30px 0;
                "
              >

                <span
                  style="
                    font-size:32px;
                    font-weight:bold;
                    letter-spacing:8px;
                  "
                >
                  ${otp}
                </span>

              </div>

              <p>
                This OTP will expire in
                <strong>10 minutes</strong>.
              </p>

              <p>
                If you did not request a password
                reset, please ignore this email.
              </p>

              <hr />

              <p
                style="
                  font-size:12px;
                  color:#777;
                "
              >
                This is an automated email from
                Grocery Sathi.
              </p>

            </div>

          </body>
        </html>
      `,
    };

    const info =
      await transporter.sendMail(
        mailOptions
      );

    console.log(
      "OTP email sent successfully:",
      info.messageId
    );

    return info;

  } catch (error) {

    console.error(
      "SEND OTP ERROR:",
      error
    );

    throw error;
  }
};

module.exports = {
  sendEmailOtp,
};