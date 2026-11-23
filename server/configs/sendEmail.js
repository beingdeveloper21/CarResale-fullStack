import nodemailer from "nodemailer";

const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass || host.includes("example.com")) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT) || 587,
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user, pass },
  });
};

export const sendEmail = async ({ to, subject, html }) => {
  const transporter = getTransporter();

  if (!transporter) {
    console.log(`[Email Service - Simulated] To: ${to} | Subject: ${subject}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "Car Resale <no-reply@carresale.com>",
      to,
      subject,
      html,
    });
    console.log("✅ Email sent to:", to);
  } catch (error) {
    console.warn("Email dispatch error:", error.message);
  }
};