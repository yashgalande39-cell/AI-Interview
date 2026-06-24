/**
 * TRESK AI — Email Service
 * =====================================================================
 * Handles transactional emails:
 *   - Email verification on registration
 *   - Password reset with time-limited tokens
 *   - Plan upgrade confirmation
 *
 * Supports three providers via EMAIL_PROVIDER env var:
 *   'resend'    → Resend.com (recommended, free 3K/month)
 *   'sendgrid'  → SendGrid
 *   'smtp'      → Any SMTP server (Gmail, Zoho, etc.)
 *
 * Falls back to console logging in development if no provider is configured.
 */

require('dotenv').config();
const crypto = require('crypto');

const EMAIL_PROVIDER  = process.env.EMAIL_PROVIDER  || 'console'; // 'resend' | 'sendgrid' | 'smtp' | 'console'
const EMAIL_FROM      = process.env.EMAIL_FROM       || 'TRESK AI <noreply@tresk.ai>';
const APP_BASE_URL    = process.env.APP_BASE_URL     || 'http://localhost:5173';
const TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

// ── Token Helpers ─────────────────────────────────────────────────────────────

/**
 * Generates a cryptographically secure hex token and its expiry timestamp.
 * @returns {{ token: string, expiresAt: Date }}
 */
const generateToken = () => ({
  token:     crypto.randomBytes(32).toString('hex'),
  expiresAt: new Date(Date.now() + TOKEN_EXPIRY_MS),
});

// ── Transport Layer ───────────────────────────────────────────────────────────

async function sendEmail({ to, subject, html }) {
  switch (EMAIL_PROVIDER) {

    case 'resend': {
      const { Resend } = require('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      const result = await resend.emails.send({
        from: EMAIL_FROM,
        to,
        subject,
        html,
      });
      if (result.error) throw new Error(`Resend error: ${result.error.message}`);
      return result;
    }

    case 'sendgrid': {
      const sgMail = require('@sendgrid/mail');
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      await sgMail.send({ from: EMAIL_FROM, to, subject, html });
      return { id: 'sendgrid-sent' };
    }

    case 'smtp': {
      const nodemailer = require('nodemailer');
      const transporter = nodemailer.createTransport({
        host:   process.env.SMTP_HOST,
        port:   parseInt(process.env.SMTP_PORT || '587', 10),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
      const info = await transporter.sendMail({ from: EMAIL_FROM, to, subject, html });
      return info;
    }

    default: {
      // Console fallback — development mode
      console.log(`\n📧 [EMAIL - CONSOLE MODE]`);
      console.log(`   To:      ${to}`);
      console.log(`   Subject: ${subject}`);
      console.log(`   Body:    ${html.replace(/<[^>]+>/g, '').trim().slice(0, 200)}`);
      console.log('');
      return { id: 'console-logged' };
    }
  }
}

// ── Email Templates ───────────────────────────────────────────────────────────

const baseTemplate = (content) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>TRESK AI</title>
</head>
<body style="margin:0;padding:0;background:#0B0F1A;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0B0F1A;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#111827;border-radius:16px;border:1px solid #1F2937;overflow:hidden;max-width:560px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:32px;text-align:center;">
            <div style="font-size:24px;font-weight:700;color:#fff;letter-spacing:-0.5px;">TRESK<span style="color:#A5B4FC;">AI</span></div>
            <div style="font-size:12px;color:#C7D2FE;margin-top:4px;font-weight:500;">Career Copilot Platform</div>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px 36px;color:#D1D5DB;">
            ${content}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 36px;border-top:1px solid #1F2937;text-align:center;">
            <p style="margin:0;font-size:11px;color:#4B5563;">
              © ${new Date().getFullYear()} TRESK AI &nbsp;·&nbsp; 
              <a href="${APP_BASE_URL}/privacy" style="color:#6366F1;text-decoration:none;">Privacy</a> &nbsp;·&nbsp;
              <a href="${APP_BASE_URL}/terms" style="color:#6366F1;text-decoration:none;">Terms</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

const buttonStyle = 'display:inline-block;padding:14px 28px;background:linear-gradient(135deg,#4F46E5,#7C3AED);color:#fff;font-weight:600;font-size:15px;text-decoration:none;border-radius:10px;margin:24px 0;';

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Send email verification link to a newly registered user.
 */
exports.sendVerificationEmail = async (to, name, token) => {
  const link = `${APP_BASE_URL}/verify-email?token=${token}`;
  const html = baseTemplate(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#F9FAFB;">Verify your email 🎉</h2>
    <p style="margin:0 0 16px;line-height:1.6;">Hi <strong style="color:#F9FAFB;">${name}</strong>, welcome to TRESK AI!</p>
    <p style="margin:0 0 8px;line-height:1.6;">Click the button below to verify your email address and unlock your account.</p>
    <div style="text-align:center;">
      <a href="${link}" style="${buttonStyle}">Verify Email Address</a>
    </div>
    <p style="margin:16px 0 0;font-size:13px;color:#6B7280;line-height:1.5;">
      This link expires in <strong>1 hour</strong>. If you didn't create an account, you can safely ignore this email.
    </p>
    <p style="margin:12px 0 0;font-size:12px;color:#4B5563;word-break:break-all;">Or copy this URL: ${link}</p>
  `);
  return sendEmail({ to, subject: 'Verify your TRESK AI email', html });
};

/**
 * Send password reset link.
 */
exports.sendPasswordResetEmail = async (to, name, token) => {
  const link = `${APP_BASE_URL}/reset-password?token=${token}`;
  const html = baseTemplate(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#F9FAFB;">Reset your password 🔐</h2>
    <p style="margin:0 0 16px;line-height:1.6;">Hi <strong style="color:#F9FAFB;">${name}</strong>,</p>
    <p style="margin:0 0 8px;line-height:1.6;">We received a request to reset your TRESK AI password. Click the button below to choose a new one.</p>
    <div style="text-align:center;">
      <a href="${link}" style="${buttonStyle}">Reset Password</a>
    </div>
    <p style="margin:16px 0 0;font-size:13px;color:#6B7280;line-height:1.5;">
      This link expires in <strong>1 hour</strong>. If you didn't request this, please ignore this email — your password won't change.
    </p>
    <p style="margin:12px 0 0;font-size:12px;color:#4B5563;word-break:break-all;">Or copy this URL: ${link}</p>
  `);
  return sendEmail({ to, subject: 'Reset your TRESK AI password', html });
};

/**
 * Send plan upgrade confirmation email.
 */
exports.sendPlanUpgradeEmail = async (to, name, planName, expiresAt) => {
  const expiryStr = new Date(expiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
  const html = baseTemplate(`
    <h2 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#F9FAFB;">You're now on ${planName}! 🚀</h2>
    <p style="margin:0 0 16px;line-height:1.6;">Hi <strong style="color:#F9FAFB;">${name}</strong>, thank you for upgrading!</p>
    <div style="background:#1F2937;border-radius:12px;padding:20px 24px;margin:0 0 20px;">
      <div style="font-size:13px;color:#9CA3AF;margin-bottom:4px;">Plan</div>
      <div style="font-size:18px;font-weight:700;color:#A5B4FC;">${planName}</div>
      <div style="font-size:13px;color:#9CA3AF;margin-top:12px;margin-bottom:4px;">Active until</div>
      <div style="font-size:15px;color:#F9FAFB;">${expiryStr}</div>
    </div>
    <p style="margin:0 0 8px;line-height:1.6;">All premium features are now unlocked. Start practising!</p>
    <div style="text-align:center;">
      <a href="${APP_BASE_URL}/dashboard" style="${buttonStyle}">Go to Dashboard</a>
    </div>
  `);
  return sendEmail({ to, subject: `Welcome to TRESK AI ${planName} Plan!`, html });
};

exports.generateToken = generateToken;
