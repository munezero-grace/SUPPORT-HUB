import { sendMail } from "../utils/mailer";

export async function sendSetPasswordEmail(params: {
  email: string;
  firstName: string;
  token: string;
}) {
  const { email, firstName, token } = params;
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
  const setPasswordUrl = `${frontendUrl}/set-password?token=${token}`;

  const text = [
    `Hi ${firstName},`,
    "",
    "An account has been created for you on Support Hub.",
    "",
    "Click the link below to set up your password and activate your account.",
    "This link will expire in 24 hours.",
    "",
    setPasswordUrl,
  ].join("\n");

  const html = `
    <p>Hi ${firstName},</p>
    <p>An account has been created for you on Support Hub.</p>
    <p>Click the link below to set up your password and activate your account. This link will expire in 24 hours.</p>
    <p><a href="${setPasswordUrl}">${setPasswordUrl}</a></p>
  `;

  await sendMail({
    to: email,
    subject: "Set up your SupportHub account",
    text,
    html,
  });
}
