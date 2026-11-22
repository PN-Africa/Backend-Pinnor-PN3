
import {
  getAppointmentsFor48HourReminder,
  getAppointmentsFor24HourReminder,
  mark48HourReminderSent,
  mark24HourReminderSent,
  release48HourReminderClaim,
  release24HourReminderClaim
} from "../repositories/reminderRepository.js";

import { sendReminderEmail } from "./emailService.js";

const reminderConfig = {
  24: {
    fetch: getAppointmentsFor24HourReminder,
    markSent: mark24HourReminderSent,
    release: release24HourReminderClaim,
    claimColumn: "reminder_24h_claimed_until",
    label: "24-hour"
  },
  48: {
    fetch: getAppointmentsFor48HourReminder,
    markSent: mark48HourReminderSent,
    release: release48HourReminderClaim,
    claimColumn: "reminder_48h_claimed_until",
    label: "48-hour"
  }
};

const formatDate = (date) => {
  const parsed = new Date(date);

  if (!date || Number.isNaN(parsed.getTime())) {
    return "See your booking details";
  }

  return parsed.toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Africa/Lagos"
  });
};

const formatTime = (time) => {
  const parsed = new Date(time);

  if (!time || Number.isNaN(parsed.getTime())) {
    return "See your booking details";
  }

  return parsed.toLocaleTimeString("en-NG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Africa/Lagos"
  });
};

const sendAppointmentReminder = async (appointment) => {
  await sendReminderEmail({
    to: appointment.patient_email,
    patientName: appointment.patient_name,
    providerName: appointment.provider?.name || "Your provider",
    serviceName: appointment.service?.name || "Your appointment",
    appointmentDate: formatDate(appointment.start_time),
    startTime: formatTime(appointment.start_time)
  });
};

const processReminders = async (hours) => {
  const config = reminderConfig[hours];
  const appointments = await config.fetch();

  let dispatchedCount = 0;
  let failedCount = 0;

  for (const appointment of appointments) {
    const claimedUntil = appointment[config.claimColumn];

    if (!claimedUntil) {
      failedCount++;

      console.error(
        `Missing ${config.label} reminder claim for appointment ${appointment.id}`
      );

      continue;
    }

    try {
      await sendAppointmentReminder(appointment);
    } catch (error) {
      failedCount++;

      console.error(
        `Failed to send ${config.label} reminder for appointment ${appointment.id}:`,
        error.message
      );

      try {
        await config.release(appointment.id, claimedUntil);
      } catch (releaseError) {
        console.error(
          `Failed to release reminder claim for appointment ${appointment.id}:`,
          releaseError.message
        );
      }

      continue;
    }

    try {
      await config.markSent(appointment.id, claimedUntil);
      dispatchedCount++;
    } catch (error) {
      failedCount++;

      console.error(
        `Email sent but reminder status update failed for appointment ${appointment.id}:`,
        error.message
      );
    }
  }

  return {
    dispatched_count: dispatchedCount,
    failed_count: failedCount
  };
};

export const process48HourReminders = () =>
  processReminders(48);

export const process24HourReminders = () =>
  processReminders(24);

export const dispatchUpcomingReminders = async () => {
  const [reminders48, reminders24] = await Promise.all([
    process48HourReminders(),
    process24HourReminders()
  ]);

  return {
    dispatched_count:
      reminders48.dispatched_count + reminders24.dispatched_count,
    failed_count:
      reminders48.failed_count + reminders24.failed_count
  };
};
