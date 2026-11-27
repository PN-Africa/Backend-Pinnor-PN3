
import nodemailer from "nodemailer";

const {
  SMTP_HOST,
  SMTP_PORT,
  SMTP_USER,
  SMTP_PASS,
  REMINDER_FROM_EMAIL
} = process.env;

const smtpConfigured =
  SMTP_HOST &&
  SMTP_PORT &&
  SMTP_USER &&
  SMTP_PASS &&
  REMINDER_FROM_EMAIL;

export const transporter = smtpConfigured
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS.replace(/\s/g, "")
      }
    })
  : null;

export const verifyEmailConnection = async () => {
  if (!transporter) {
    throw new Error("Google SMTP is not configured.");
  }

  return transporter.verify();
};
