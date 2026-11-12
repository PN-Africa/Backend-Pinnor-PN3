
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

export const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    };

    return entities[character];
  });

const sendEmail = async ({ to, subject, html }) => {
  if (!resend) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  if (!process.env.REMINDER_FROM_EMAIL) {
    throw new Error("REMINDER_FROM_EMAIL is not configured");
  }

  const { data, error } = await resend.emails.send({
    from: process.env.REMINDER_FROM_EMAIL,
    to,
    subject,
    html
  });

  if (error) {
    throw error;
  }

  return data;
};

export const sendCancellationConfirmationEmail = async (booking) => {
  const appointmentDate = new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  }).format(
    new Date(`${booking.appointment_date}T00:00:00Z`)
  );

  const formatTime = (value) =>
    new Intl.DateTimeFormat("en-NG", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Africa/Lagos"
    }).format(new Date(value));

  const html = `
    <h2>Appointment Cancelled</h2>

    <p>Hello ${escapeHtml(booking.patient_name)},</p>

    <p>Your appointment has been successfully cancelled.</p>

    <p>
      <strong>Booking reference:</strong>
      ${escapeHtml(booking.booking_reference)}<br />

      <strong>Provider:</strong>
      ${escapeHtml(booking.provider_name || "Not specified")}<br />

      <strong>Service:</strong>
      ${escapeHtml(booking.service_name || "Not specified")}<br />

      <strong>Appointment date:</strong>
      ${escapeHtml(appointmentDate)}<br />

      <strong>Appointment time:</strong>
      ${escapeHtml(formatTime(booking.start_time))} -
      ${escapeHtml(formatTime(booking.end_time))}
    </p>

    <p>
      If you did not request this cancellation,
      please contact Pinnor.
    </p>

    <p>Thank you,<br />Pinnor</p>
  `;

  return sendEmail({
    to: booking.patient_email,
    subject: "Appointment Cancellation Confirmation - Pinnor",
    html
  });
};
