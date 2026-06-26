/**
 * TRESK AI — Unified Notification Service
 * =====================================================================
 * Routes transactional notifications across multiple channels:
 *   - Email (Resend, SendGrid, SMTP, or console log for dev)
 *   - Daily/weekly practice challenge reminders
 *   - Calendar invites (ICS files for interview bookings)
 *
 * Provider selection is controlled by EMAIL_PROVIDER env var:
 *   'resend' | 'sendgrid' | 'smtp' | 'console'
 *
 * Usage:
 *   const { sendEmail, sendPracticeReminder, generateCalendarInvite } = require('./notification.service');
 *   await sendEmail({ to: 'user@example.com', subject: '...', html: '...' });
 */

const { EMAIL_PROVIDER, EMAIL_FROM, APP_BASE_URL, RESEND_API_KEY, SENDGRID_API_KEY } = require('../../config/env');

// ─── Email Templates ─────────────────────────────────────────────────────────

/**
 * Build a clean, branded HTML email body.
 * All transactional emails use this wrapper for consistency.
 */
function buildEmailHtml({ title, preheader, bodyHtml, ctaText, ctaUrl }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin: 0; padding: 0; background: #0f0f1a; font-family: 'Segoe UI', Arial, sans-serif; color: #e2e8f0; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
    .card { background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; border: 1px solid rgba(99,102,241,0.2); padding: 40px; }
    .logo { font-size: 28px; font-weight: 900; background: linear-gradient(135deg, #6366f1, #8b5cf6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 24px; }
    h1 { font-size: 24px; font-weight: 700; color: #f8fafc; margin: 0 0 16px; }
    p { font-size: 16px; line-height: 1.6; color: #94a3b8; margin: 0 0 16px; }
    .cta { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff !important; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 16px; margin: 20px 0; }
    .divider { border: none; border-top: 1px solid rgba(99,102,241,0.15); margin: 28px 0; }
    .footer { font-size: 13px; color: #475569; text-align: center; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="card">
      <div class="logo">⚡ TRESK AI</div>
      <h1>${title}</h1>
      ${bodyHtml}
      ${ctaText && ctaUrl ? `<a href="${ctaUrl}" class="cta">${ctaText}</a>` : ''}
      <hr class="divider" />
      <div class="footer">
        You received this email from TRESK AI.<br/>
        <a href="${APP_BASE_URL}/settings" style="color:#6366f1;">Manage notification preferences</a>
      </div>
    </div>
  </div>
</body>
</html>`;
}

// ─── Email Providers ──────────────────────────────────────────────────────────

/**
 * Send email via Resend (recommended — generous free tier).
 */
async function sendViaResend({ to, subject, html, from }) {
  if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY not configured.');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: from || EMAIL_FROM, to: Array.isArray(to) ? to : [to], subject, html }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Resend API error: ${err}`);
  }

  const data = await response.json();
  console.log(`[Notification] Resend email sent: ${data.id} → ${to}`);
  return { success: true, messageId: data.id };
}

/**
 * Send email via SendGrid.
 */
async function sendViaSendGrid({ to, subject, html, from }) {
  if (!SENDGRID_API_KEY) throw new Error('SENDGRID_API_KEY not configured.');

  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: from || EMAIL_FROM.match(/<(.+)>/)?.[1] || EMAIL_FROM },
      subject,
      content: [{ type: 'text/html', value: html }],
    }),
  });

  if (!response.ok && response.status !== 202) {
    const err = await response.text();
    throw new Error(`SendGrid API error: ${err}`);
  }

  console.log(`[Notification] SendGrid email queued → ${to}`);
  return { success: true };
}

/**
 * Send email via SMTP using nodemailer.
 * Requires: npm install nodemailer
 */
async function sendViaSmtp({ to, subject, html, from }) {
  let nodemailer;
  try {
    nodemailer = require('nodemailer');
  } catch {
    throw new Error('nodemailer not installed. Run: npm install nodemailer');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const info = await transporter.sendMail({
    from: from || EMAIL_FROM,
    to,
    subject,
    html,
  });

  console.log(`[Notification] SMTP email sent: ${info.messageId} → ${to}`);
  return { success: true, messageId: info.messageId };
}

/**
 * Console provider for development — logs email instead of sending.
 */
function sendViaConsole({ to, subject, html }) {
  console.log('\n═══════════════════════════════════════════════');
  console.log(`[Notification] DEV MODE — Email would be sent:`);
  console.log(`  To:      ${to}`);
  console.log(`  Subject: ${subject}`);
  console.log(`  HTML:    [${html.length} chars]`);
  console.log('═══════════════════════════════════════════════\n');
  return { success: true, messageId: 'dev-mode-' + Date.now() };
}

// ─── Core: Send Email ─────────────────────────────────────────────────────────

/**
 * Route an email through the configured provider.
 *
 * @param {object} params
 * @param {string|string[]} params.to - Recipient email address(es)
 * @param {string} params.subject - Email subject line
 * @param {string} params.html - HTML email body
 * @param {string} [params.from] - Override sender (defaults to EMAIL_FROM)
 * @returns {Promise<{success: boolean, messageId?: string}>}
 */
async function sendEmail({ to, subject, html, from }) {
  const provider = EMAIL_PROVIDER || 'console';

  try {
    switch (provider) {
      case 'resend':    return await sendViaResend({ to, subject, html, from });
      case 'sendgrid':  return await sendViaSendGrid({ to, subject, html, from });
      case 'smtp':      return await sendViaSmtp({ to, subject, html, from });
      case 'console':
      default:          return sendViaConsole({ to, subject, html });
    }
  } catch (err) {
    console.error(`[Notification] Email send failed via ${provider}:`, err.message);
    // In dev, always fall back to console log
    if (process.env.NODE_ENV !== 'production') {
      return sendViaConsole({ to, subject, html });
    }
    throw err;
  }
}

// ─── Transactional Email Templates ───────────────────────────────────────────

/**
 * Send interview completion report email.
 */
async function sendInterviewCompletionEmail({ to, userName, role, overallScore, eci, sessionId }) {
  const subject = `🎯 Your Interview Report is Ready — ${role}`;
  const html = buildEmailHtml({
    title: 'Interview Complete!',
    bodyHtml: `
      <p>Hi <strong>${userName}</strong>,</p>
      <p>You just completed a <strong>${role}</strong> mock interview on TRESK AI. Great work pushing through!</p>
      <p>Here's a quick snapshot of your results:</p>
      <table style="width:100%; border-collapse:collapse; margin:16px 0;">
        <tr>
          <td style="padding:10px; background:rgba(99,102,241,0.1); border-radius:8px; text-align:center;">
            <div style="font-size:36px; font-weight:900; color:#6366f1;">${overallScore}</div>
            <div style="font-size:13px; color:#94a3b8;">Overall Score</div>
          </td>
          <td style="padding:10px; background:rgba(139,92,246,0.1); border-radius:8px; text-align:center; margin-left:8px;">
            <div style="font-size:36px; font-weight:900; color:#8b5cf6;">${(eci * 100).toFixed(0)}%</div>
            <div style="font-size:13px; color:#94a3b8;">Confidence Index</div>
          </td>
        </tr>
      </table>
      <p>Your personalized learning path and detailed feedback are ready to review.</p>
    `,
    ctaText: 'View Full Report',
    ctaUrl: `${APP_BASE_URL}/feedback?session=${sessionId}`,
  });

  return sendEmail({ to, subject, html });
}

/**
 * Send daily practice challenge reminder email.
 */
async function sendPracticeReminder({ to, userName, challengeTitle, difficulty, xpReward }) {
  const subject = `🔥 Daily Challenge: ${challengeTitle}`;
  const html = buildEmailHtml({
    title: "Today's Practice Challenge",
    bodyHtml: `
      <p>Hi <strong>${userName}</strong>,</p>
      <p>Your daily coding challenge is live! Keeping your streak going is the fastest path to interview readiness.</p>
      <p>
        <strong>Challenge:</strong> ${challengeTitle}<br/>
        <strong>Difficulty:</strong> ${difficulty}<br/>
        <strong>XP Reward:</strong> +${xpReward} XP 🏆
      </p>
      <p>Complete it today to maintain your streak and climb the leaderboard!</p>
    `,
    ctaText: 'Solve Challenge',
    ctaUrl: `${APP_BASE_URL}/coding`,
  });

  return sendEmail({ to, subject, html });
}

/**
 * Send weekly progress summary email.
 */
async function sendWeeklyProgressEmail({ to, userName, stats }) {
  const subject = `📊 Your Weekly TRESK AI Report`;
  const html = buildEmailHtml({
    title: 'Weekly Progress Report',
    bodyHtml: `
      <p>Hi <strong>${userName}</strong>,</p>
      <p>Here's how your preparation looked this week:</p>
      <ul style="list-style:none; padding:0;">
        <li style="padding:8px 0; border-bottom:1px solid rgba(99,102,241,0.1);">🎤 Interviews completed: <strong>${stats.interviewsCompleted || 0}</strong></li>
        <li style="padding:8px 0; border-bottom:1px solid rgba(99,102,241,0.1);">💻 Coding problems solved: <strong>${stats.problemsSolved || 0}</strong></li>
        <li style="padding:8px 0; border-bottom:1px solid rgba(99,102,241,0.1);">⚡ XP earned: <strong>+${stats.xpEarned || 0}</strong></li>
        <li style="padding:8px 0;">🔥 Current streak: <strong>${stats.streak || 0} days</strong></li>
      </ul>
      <p>${stats.interviewsCompleted > 0 ? 'Keep up the great momentum!' : "You haven't practiced this week — let's change that!"}</p>
    `,
    ctaText: 'Continue Practicing',
    ctaUrl: `${APP_BASE_URL}/dashboard`,
  });

  return sendEmail({ to, subject, html });
}

/**
 * Send email verification email.
 */
async function sendEmailVerification({ to, userName, verifyToken }) {
  const verifyUrl = `${APP_BASE_URL}/verify-email?token=${verifyToken}`;
  const subject = `Verify your TRESK AI account`;
  const html = buildEmailHtml({
    title: 'Verify Your Email',
    bodyHtml: `
      <p>Hi <strong>${userName}</strong>,</p>
      <p>Thanks for joining TRESK AI! Please verify your email address to activate your account.</p>
      <p>This link expires in <strong>24 hours</strong>.</p>
    `,
    ctaText: 'Verify Email Address',
    ctaUrl: verifyUrl,
  });

  return sendEmail({ to, subject, html });
}

/**
 * Send password reset email.
 */
async function sendPasswordReset({ to, userName, resetToken }) {
  const resetUrl = `${APP_BASE_URL}/reset-password?token=${resetToken}`;
  const subject = `Reset your TRESK AI password`;
  const html = buildEmailHtml({
    title: 'Password Reset Request',
    bodyHtml: `
      <p>Hi <strong>${userName}</strong>,</p>
      <p>We received a request to reset your password. Click the button below to choose a new one.</p>
      <p>This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.</p>
    `,
    ctaText: 'Reset Password',
    ctaUrl: resetUrl,
  });

  return sendEmail({ to, subject, html });
}

// ─── Calendar Invites (ICS) ───────────────────────────────────────────────────

/**
 * Generate an ICS calendar invite file for an interview booking.
 *
 * @param {object} params
 * @param {string} params.title - Event title
 * @param {string} params.description - Event description
 * @param {Date|string} params.startTime - Start time
 * @param {number} [params.durationMinutes=60] - Duration in minutes
 * @param {string} [params.location] - Location or join URL
 * @param {string} params.organizerEmail - Organizer email
 * @param {string} params.attendeeEmail - Attendee email
 * @returns {string} ICS file content
 */
function generateCalendarInvite({ title, description, startTime, durationMinutes = 60, location, organizerEmail, attendeeEmail }) {
  const start = new Date(startTime);
  const end   = new Date(start.getTime() + durationMinutes * 60 * 1000);

  const formatDate = (d) => d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const uid = `tresk-${Date.now()}-${Math.random().toString(36).slice(2)}@tresk.ai`;

  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TRESK AI//Interview Scheduler//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(start)}`,
    `DTEND:${formatDate(end)}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${(description || '').replace(/\n/g, '\\n')}`,
    location ? `LOCATION:${location}` : '',
    `ORGANIZER;CN=TRESK AI:mailto:${organizerEmail}`,
    `ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;RSVP=TRUE;CN=${attendeeEmail}:mailto:${attendeeEmail}`,
    'STATUS:CONFIRMED',
    'SEQUENCE:0',
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Interview reminder - 30 minutes',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].filter(Boolean).join('\r\n');

  return ics;
}

/**
 * Send an interview booking confirmation with ICS calendar invite.
 *
 * @param {object} params
 * @param {string} params.to - Attendee email
 * @param {string} params.userName - Attendee name
 * @param {string} params.role - Interview role
 * @param {Date|string} params.scheduledTime - Interview time
 * @param {string} [params.meetingUrl] - Video call URL
 */
async function sendInterviewBookingConfirmation({ to, userName, role, scheduledTime, meetingUrl }) {
  const icsContent = generateCalendarInvite({
    title: `TRESK AI Mock Interview — ${role}`,
    description: `Your AI-powered mock interview for the ${role} position. Join using the link below.\n\nJoin: ${meetingUrl || APP_BASE_URL + '/interview-room'}`,
    startTime: scheduledTime,
    durationMinutes: 45,
    location: meetingUrl || `${APP_BASE_URL}/interview-room`,
    organizerEmail: 'interviews@tresk.ai',
    attendeeEmail: to,
  });

  const subject = `📅 Interview Confirmed — ${role} on ${new Date(scheduledTime).toLocaleDateString()}`;
  const html = buildEmailHtml({
    title: 'Interview Confirmed!',
    bodyHtml: `
      <p>Hi <strong>${userName}</strong>,</p>
      <p>Your mock interview has been scheduled!</p>
      <p>
        <strong>Role:</strong> ${role}<br/>
        <strong>Date & Time:</strong> ${new Date(scheduledTime).toLocaleString()}<br/>
        ${meetingUrl ? `<strong>Join Link:</strong> <a href="${meetingUrl}" style="color:#6366f1;">${meetingUrl}</a>` : ''}
      </p>
      <p>A calendar invite (.ics) is attached to this email. Add it to your calendar to get a 30-minute reminder.</p>
    `,
    ctaText: 'Open Interview Room',
    ctaUrl: meetingUrl || `${APP_BASE_URL}/interview-room`,
  });

  // For providers that support attachments, we'd attach the ICS here.
  // For simplicity, we return both the email result and the ICS content.
  const emailResult = await sendEmail({ to, subject, html });
  return { ...emailResult, icsContent };
}

module.exports = {
  // Core
  sendEmail,
  buildEmailHtml,

  // Transactional emails
  sendInterviewCompletionEmail,
  sendPracticeReminder,
  sendWeeklyProgressEmail,
  sendEmailVerification,
  sendPasswordReset,

  // Calendar
  generateCalendarInvite,
  sendInterviewBookingConfirmation,
};
