
import {
  getAppointmentsFor48HourReminder,
  getAppointmentsFor24HourReminder,
  mark48HourReminderSent,
  mark24HourReminderSent
} from "../repositories/reminderRepository.js";

import { sendReminderEmail } from "./emailService.js";

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Africa/Lagos"
  });

const formatTime = (time) =>
  new Date(time).toLocaleTimeString("en-NG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Africa/Lagos"
  });

const sendAppointmentReminder = async (
  appointment,
  markReminderSent
) => {
  await sendReminderEmail({
    to: appointment.patient_email,
    patientName: appointment.patient_name,
    providerName: appointment.provider?.name || "Your provider",
    serviceName: appointment.service?.name || "Your appointment",
    appointmentDate: formatDate(appointment.start_time),
    startTime: formatTime(appointment.start_time)
  });

  await markReminderSent(appointment.id);
};

const processReminders = async (
  fetchAppointments,
  markReminderSent,
  reminderType
) => {
  const appointments = await fetchAppointments();
  let dispatchedCount = 0;
  let failedCount = 0;

  for (const appointment of appointments) {
    try {
      await sendAppointmentReminder(appointment, markReminderSent);
      dispatchedCount++;
    } catch (error) {
      failedCount++;
      console.error(
        `Failed to send ${reminderType} reminder for ${appointment.id}:`,
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
  processReminders(
    getAppointmentsFor48HourReminder,
    mark48HourReminderSent,
    "48-hour"
  );

export const process24HourReminders = () =>
  processReminders(
    getAppointmentsFor24HourReminder,
    mark24HourReminderSent,
    "24-hour"
  );

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
