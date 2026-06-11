import { sendMail } from "../utils/mailer";

export async function sendWelcomeEmail(params: {
  email: string;
  firstName: string;
  temporaryPassword: string;
}) {
  const { email, firstName, temporaryPassword } = params;
  const loginUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  const text = [
    `Hi ${firstName},`,
    "",
    "An account has been created for you on Support Hub.",
    "",
    `Email: ${email}`,
    `Temporary password: ${temporaryPassword}`,
    "",
    "You must change this password the first time you log in.",
    "",
    `Login here: ${loginUrl}`,
  ].join("\n");

  const html = `
    <p>Hi ${firstName},</p>
    <p>An account has been created for you on Support Hub.</p>
    <p>
      <strong>Email:</strong> ${email}<br/>
      <strong>Temporary password:</strong> ${temporaryPassword}
    </p>
    <p>You must change this password the first time you log in.</p>
    <p><a href="${loginUrl}">${loginUrl}</a></p>
  `;

  await sendMail({
    to: email,
    subject: "Welcome to Support Hub - Your account details",
    text,
    html,
  });
}
