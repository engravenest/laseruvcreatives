import nodemailer from "nodemailer";
import { STORE_CONFIG } from "@/constants/store";

interface SendMailParams {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export function isEmailConfigured(): boolean {
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim().length > 0) {
    return true;
  }
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.SMTP_HOST.trim().length > 0
  ) {
    return true;
  }
  return false;
}

async function sendEmail({ to, subject, html, replyTo }: SendMailParams): Promise<{ success: boolean; id?: string }> {
  const from = process.env.EMAIL_FROM || "LaserUVCreatives <onboarding@resend.dev>";

  // Provider 1: Resend HTTP API (Zero dependencies, generous free tier)
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim().length > 0) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject,
        html,
        reply_to: replyTo,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      const errMsg = data?.message || data?.error || res.statusText;
      throw new Error(`Resend email delivery failed: ${errMsg}`);
    }
    return { success: true, id: data.id };
  }

  // Provider 2: SMTP (Gmail App Password, Brevo, SendGrid, Mailgun, etc.)
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: Number(process.env.SMTP_PORT) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
      replyTo,
    });

    return { success: true, id: info.messageId };
  }

  // If no provider is configured, fail with explicit instruction (NO simulation allowed)
  throw new Error(
    "Email service is not configured. Please add RESEND_API_KEY (from https://resend.com) or SMTP credentials (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS) to your .env.local file."
  );
}

// -------------------------------------------------------------
// Transactional Templates (Customer OTP, Reset, Contact Us)
// -------------------------------------------------------------

export async function sendOtpEmail({
  to,
  customerName,
  otpCode,
}: {
  to: string;
  customerName: string;
  otpCode: string;
}) {
  const subject = `Your LaserUVCreatives Verification Code: ${otpCode}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #f4f4f5; padding: 40px 20px; line-height: 1.6;">
      <div style="max-width: 520px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 32px; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #f59e0b; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">LaserUVCreatives</h1>
          <p style="color: #a1a1aa; font-size: 13px; margin: 4px 0 0 0;">Custom Laser & UV Engraved Gifts & Essentials</p>
        </div>

        <p style="font-size: 15px; color: #e4e4e7; margin: 0 0 16px 0;">Hello ${customerName},</p>
        <p style="font-size: 14px; color: #a1a1aa; margin: 0 0 24px 0;">
          Thank you for creating an account with LaserUVCreatives. Please use the 6-digit verification code below to activate your account:
        </p>

        <div style="text-align: center; margin: 28px 0; background: #27272a; border: 1px dashed #d97706; border-radius: 12px; padding: 20px;">
          <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #fbbf24; font-family: monospace;">${otpCode}</span>
        </div>

        <p style="font-size: 13px; color: #71717a; margin: 0 0 8px 0;">
          • This code will expire in <strong>10 minutes</strong>.
        </p>
        <p style="font-size: 13px; color: #71717a; margin: 0 0 24px 0;">
          • If you did not create this account, you can safely ignore this email.
        </p>

        <div style="border-top: 1px solid #27272a; padding-top: 20px; text-align: center; font-size: 12px; color: #52525b;">
          LaserUVCreatives • Pakistan Nationwide Logistics via TCS & Leopard<br />
          Need assistance? WhatsApp us at <a href="https://wa.me/${STORE_CONFIG.whatsappNumber}" style="color: #f59e0b; text-decoration: none;">+${STORE_CONFIG.whatsappNumber}</a>
        </div>
      </div>
    </div>
  `;

  return sendEmail({ to, subject, html });
}

export async function sendPasswordResetEmail({
  to,
  customerName,
  resetCode,
}: {
  to: string;
  customerName: string;
  resetCode: string;
}) {
  const subject = `Reset Your LaserUVCreatives Password: ${resetCode}`;
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #f4f4f5; padding: 40px 20px; line-height: 1.6;">
      <div style="max-width: 520px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 32px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #f59e0b; margin: 0; font-size: 24px; font-weight: 800;">LaserUVCreatives</h1>
          <p style="color: #a1a1aa; font-size: 13px; margin: 4px 0 0 0;">Password Reset Request</p>
        </div>

        <p style="font-size: 15px; color: #e4e4e7; margin: 0 0 16px 0;">Hello ${customerName},</p>
        <p style="font-size: 14px; color: #a1a1aa; margin: 0 0 24px 0;">
          We received a request to reset your password. Use the verification code below to authorize your password change:
        </p>

        <div style="text-align: center; margin: 28px 0; background: #27272a; border: 1px dashed #d97706; border-radius: 12px; padding: 20px;">
          <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #fbbf24; font-family: monospace;">${resetCode}</span>
        </div>

        <p style="font-size: 13px; color: #71717a; margin: 0 0 8px 0;">
          • This code will expire in <strong>10 minutes</strong>.
        </p>
        <p style="font-size: 13px; color: #71717a; margin: 0 0 24px 0;">
          • If you did not request a password reset, please contact us immediately.
        </p>
      </div>
    </div>
  `;

  return sendEmail({ to, subject, html });
}

export async function sendContactFormEmail({
  name,
  email,
  phone,
  subject,
  message,
}: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  const destinationEmail = STORE_CONFIG.supportEmail || "engravenest@gmail.com";
  const emailSubject = `[LaserUVCreatives Contact Inquiry] ${subject} - from ${name}`;

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #09090b; color: #f4f4f5; padding: 40px 20px;">
      <div style="max-width: 600px; margin: 0 auto; background-color: #18181b; border: 1px solid #27272a; border-radius: 16px; padding: 32px;">
        <h2 style="color: #f59e0b; margin: 0 0 20px 0; font-size: 20px;">New Customer Contact Form Submission</h2>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr>
            <td style="padding: 8px 0; color: #a1a1aa; width: 140px; font-size: 14px;"><strong>Customer Name:</strong></td>
            <td style="padding: 8px 0; color: #f4f4f5; font-size: 14px;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #a1a1aa; font-size: 14px;"><strong>Email Address:</strong></td>
            <td style="padding: 8px 0; color: #f4f4f5; font-size: 14px;"><a href="mailto:${email}" style="color: #60a5fa;">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #a1a1aa; font-size: 14px;"><strong>Phone / WhatsApp:</strong></td>
            <td style="padding: 8px 0; color: #f4f4f5; font-size: 14px;">${phone || "Not provided"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #a1a1aa; font-size: 14px;"><strong>Inquiry Subject:</strong></td>
            <td style="padding: 8px 0; color: #f59e0b; font-size: 14px;"><strong>${subject}</strong></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; color: #a1a1aa; font-size: 14px;"><strong>Date & Time:</strong></td>
            <td style="padding: 8px 0; color: #71717a; font-size: 13px;">${new Date().toLocaleString("en-PK", { timeZone: "Asia/Karachi" })} PKT</td>
          </tr>
        </table>

        <div style="background-color: #27272a; border-left: 4px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <h4 style="margin: 0 0 8px 0; color: #fbbf24; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px;">Message Content:</h4>
          <p style="margin: 0; color: #f4f4f5; white-space: pre-wrap; font-size: 14px; line-height: 1.6;">${message}</p>
        </div>

        <p style="font-size: 12px; color: #71717a; margin: 0;">
          💡 You can reply directly to this email to respond to <strong>${name}</strong> (${email}).
        </p>
      </div>
    </div>
  `;

  return sendEmail({
    to: destinationEmail,
    subject: emailSubject,
    html,
    replyTo: email,
  });
}
