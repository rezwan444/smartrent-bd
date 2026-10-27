import nodemailer from "nodemailer";

export interface SendOtpResult {
  success: boolean;
  delivered: boolean;
  message: string;
  error?: string;
}

/**
 * Creates and returns the Nodemailer SMTP transporter.
 * Supports Gmail App Password or custom SMTP credentials.
 */
function getTransporter() {
  const emailUser =
    process.env.CONTACT_EMAIL_USER ||
    process.env.EMAIL_USER ||
    process.env.SMTP_USER;
  const rawPass =
    process.env.CONTACT_EMAIL_APP_PASSWORD ||
    process.env.EMAIL_PASS ||
    process.env.SMTP_PASS;
  const emailPass = rawPass ? rawPass.replace(/[" ]/g, "") : undefined;

  if (!emailUser || !emailPass) {
    return null;
  }

  const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
  const smtpPort = Number(process.env.SMTP_PORT) || 465;

  return nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,
  });
}

/**
 * Sends a branded password recovery OTP to the user's email.
 */
export async function sendOtpEmail(toEmail: string, otp: string): Promise<SendOtpResult> {
  const transporter = getTransporter();

  // If no SMTP credentials are configured in .env
  if (!transporter) {
    console.warn("\n=======================================================");
    console.warn("⚠️ [SMTP NOT CONFIGURED] Real email cannot be sent!");
    console.warn("To send real emails to Gmail, please add to your .env file:");
    console.warn("EMAIL_USER=\"your-gmail@gmail.com\"");
    console.warn("EMAIL_PASS=\"your-16-char-gmail-app-password\"");
    console.warn(`[OTP Generated for ${toEmail}]: ${otp}`);
    console.warn("=======================================================\n");

    return {
      success: true,
      delivered: false,
      message: "SMTP credentials not configured in .env. Real email delivery skipped.",
    };
  }

  const senderEmail = process.env.CONTACT_EMAIL_USER || process.env.EMAIL_USER || process.env.SMTP_USER;
  const emailFrom = process.env.EMAIL_FROM || `"SmartRent BD" <${senderEmail}>`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 500px; margin: 0 auto; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 32px; }
        .brand { color: #166534; font-size: 20px; font-weight: bold; margin-bottom: 8px; }
        .subtitle { color: #64748b; font-size: 13px; margin-bottom: 24px; }
        .title { font-size: 18px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
        .text { font-size: 14px; color: #334155; line-height: 1.6; margin-bottom: 20px; }
        .otp-box { background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0; }
        .otp-code { font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #15803d; font-family: monospace; }
        .footer { border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px; font-size: 12px; color: #94a3b8; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="brand">SmartRent BD</div>
        <div class="subtitle">Student & Bachelor Housing Platform</div>
        
        <div class="title">Password Reset Verification</div>
        <div class="text">
          We received a request to reset your password. Use the verification code below to complete the recovery process:
        </div>

        <div class="otp-box">
          <div class="otp-code">${otp}</div>
        </div>

        <div class="text" style="font-size: 13px; color: #64748b;">
          This code is valid for <strong>15 minutes</strong>. If you did not request this password reset, please ignore this email or secure your account.
        </div>

        <div class="footer">
          &copy; ${new Date().getFullYear()} SmartRent BD. End-to-end secured • Zero broker charges.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await transporter.sendMail({
      from: emailFrom,
      to: toEmail,
      subject: `Your SmartRent BD Verification Code: ${otp}`,
      text: `Your SmartRent BD verification code is: ${otp}. It expires in 15 minutes.`,
      html: htmlContent,
    });

    console.log(`✅ [Email Delivered] Sent verification OTP to ${toEmail}`);
    return {
      success: true,
      delivered: true,
      message: `Verification code successfully delivered to ${toEmail}.`,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "SMTP transport failure";
    console.error(`❌ [Email Delivery Failed]:`, errorMsg);
    return {
      success: false,
      delivered: false,
      message: "Failed to send email via SMTP.",
      error: errorMsg,
    };
  }
}
