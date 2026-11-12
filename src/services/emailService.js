
import { Resend } from "resend";

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
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.REMINDER_FROM_EMAIL;

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  if (!from) {
    throw new Error("REMINDER_FROM_EMAIL is not configured.");
  }

  if (!to) {
    throw new Error("Recipient email address is required.");
  }

  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from,
    to,
    subject,
    html
  });

  if (error) {
    throw new Error(`Resend email failed: ${error.message}`);
  }

  return data;
};

export const sendBookingConfirmationEmail = async (booking) => {
  const date = booking.appointment_date
    ? new Date(`${booking.appointment_date}T12:00:00`)
        .toLocaleDateString("en-NG", {
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: "Africa/Lagos"
        })
    : "See your booking details";

  const time = booking.start_time
    ? new Date(booking.start_time).toLocaleTimeString("en-NG", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Africa/Lagos"
      })
    : "See your booking details";

  return sendEmail({
    to: booking.patient_email,
    subject: "Appointment Booking Confirmation - Pinnor",
    html: `
      <h2>Appointment Booked Successfully</h2>
      <p>Hello ${escapeHtml(booking.patient_name)},</p>
      <p>Your appointment has been booked successfully.</p>

      <p>
        <strong>Booking reference:</strong>
        ${escapeHtml(booking.booking_reference)}<br />
        <strong>Provider:</strong>
        ${escapeHtml(booking.provider_name || "Not specified")}<br />
        <strong>Service:</strong>
        ${escapeHtml(booking.service_name || "Not specified")}<br />
        <strong>Date:</strong> ${escapeHtml(date)}<br />
        <strong>Time:</strong> ${escapeHtml(time)}
      </p>

      <p>Please keep your booking reference for future enquiries.</p>
      <p>Thank you for choosing Pinnor.</p>
    `
  });
};

export const sendReminderEmail = async ({
  to,
  patientName,
  providerName,
  serviceName,
  appointmentDate,
  startTime
}) => {
  return sendEmail({
    to,
    subject: "Appointment Reminder - Pinnor",
    html: `
      <h2>Appointment Reminder</h2>
      <p>Hello ${escapeHtml(patientName)},</p>
      <p>This is a reminder that you have an upcoming appointment.</p>
      <p>
        <strong>Provider:</strong> ${escapeHtml(providerName)}<br />
        <strong>Service:</strong> ${escapeHtml(serviceName)}<br />
        <strong>Date:</strong> ${escapeHtml(appointmentDate)}<br />
        <strong>Time:</strong> ${escapeHtml(startTime)}
      </p>
      <p>Please arrive at the facility 15 minutes before your appointment to allow time for check-in.</p>
      <p>Thank you,<br />Pinnor</p>
    `
  });
};

export const sendRescheduleConfirmationEmail = async (booking) => {
  const date = booking.appointment_date
    ? new Date(`${booking.appointment_date}T12:00:00`)
        .toLocaleDateString("en-NG", {
          day: "numeric",
          month: "long",
          year: "numeric",
          timeZone: "Africa/Lagos"
        })
    : "See your booking details";

  const time = booking.start_time
    ? new Date(booking.start_time).toLocaleTimeString("en-NG", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
        timeZone: "Africa/Lagos"
      })
    : "See your booking details";

  return sendEmail({
    to: booking.patient_email,
    subject: "Appointment Rescheduled - Pinnor",
    html: `
      <h2>Appointment Rescheduled Successfully</h2>
      <p>Hello ${escapeHtml(booking.patient_name)},</p>
      <p>Your appointment has been rescheduled successfully.</p>
      <p>
        <strong>Booking reference:</strong>
        ${escapeHtml(booking.booking_reference)}<br />
        <strong>Provider:</strong>
        ${escapeHtml(booking.provider_name || "Not specified")}<br />
        <strong>Service:</strong>
        ${escapeHtml(booking.service_name || "Not specified")}<br />
        <strong>New date:</strong> ${escapeHtml(date)}<br />
        <strong>New time:</strong> ${escapeHtml(time)}
      </p>
      <p>Thank you for choosing Pinnor.</p>
    `
  });
};


export const sendCancellationConfirmationEmail = async (booking) => {
  const appointmentDate = new Date(
    `${booking.appointment_date}T00:00:00`
  ).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Africa/Lagos"
  });

  const formatTime = (value) =>
    new Intl.DateTimeFormat("en-NG", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
      timeZone: "Africa/Lagos"
    }).format(new Date(value));

  return sendEmail({
    to: booking.patient_email,
    subject: "Appointment Cancellation Confirmation - Pinnor",
    html: `
      <h2>Appointment Cancelled</h2>

      <p>Hello ${escapeHtml(booking.patient_name)},</p>

      <p>
        Your appointment has been successfully cancelled.
      </p>

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
        ${escapeHtml(formatTime(booking.start_time))}
        - 
        ${escapeHtml(formatTime(booking.end_time))}
      </p>

      <p>
        If you did not request this cancellation,
        please contact Pinnor.
      </p>

      <p>Thank you,<br />Pinnor</p>
    `
  });
};
