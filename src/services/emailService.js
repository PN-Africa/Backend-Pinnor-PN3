import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendReminderEmail = async ({
  to,
  patientName,
  providerName,
  serviceName,
  appointmentDate,
  startTime
}) => {
  const { data, error } = await resend.emails.send({
    from: process.env.REMINDER_FROM_EMAIL,
    to,
    subject: "Appointment Reminder - Pinnor",
    html: `
      <h2>Appointment Reminder</h2>

      <p>Hello ${patientName},</p>

      <p>
        This is a reminder that you have an upcoming appointment.
      </p>

      <p>
        <strong>Provider:</strong> ${providerName}<br />
        <strong>Service:</strong> ${serviceName}<br />
        <strong>Date:</strong> ${appointmentDate}<br />
        <strong>Time:</strong> ${startTime}
      </p>

      <p>
        Please make sure you are available for your appointment.
      </p>

      <p>
        Thank you,<br />
        Pinnor
      </p>
    `
  });

  if (error) {
    throw error;
  }

  return data;
};