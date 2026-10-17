import {
  getAppointmentsFor48HourReminder,
  getAppointmentsFor24HourReminder,
  mark48HourReminderSent,
  mark24HourReminderSent
} from "../repositories/reminderRepository.js";

import { sendReminderEmail } from "./emailService.js";

const formatDate = (date) => {
  return new Date(date).toLocaleDateString("en-NG", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
};

const formatTime = (time) => {
  return new Date(time).toLocaleTimeString("en-NG", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true
  });
};

const sendAppointmentReminder = async (
  appointment,
  markReminderSent
) => {
  await sendReminderEmail({
    to: appointment.patient_email,
    patientName: appointment.patient_name,
    providerName: appointment.provider?.name || "Your provider",
    serviceName: appointment.service?.name || "Your appointment",
    appointmentDate: formatDate(appointment.appointment_date),
    startTime: formatTime(appointment.start_time)
  });

  await markReminderSent(appointment.id);
};

export const process48HourReminders = async () => {
  const appointments = await getAppointmentsFor48HourReminder();

  for (const appointment of appointments) {
    try {
      await sendAppointmentReminder(
        appointment,
        mark48HourReminderSent
      );
    } catch (error) {
      console.error(
        `Failed to send 48-hour reminder for ${appointment.id}:`,
        error
      );
    }
  }
};

export const process24HourReminders = async () => {
  const appointments = await getAppointmentsFor24HourReminder();

  for (const appointment of appointments) {
    try {
      await sendAppointmentReminder(
        appointment,
        mark24HourReminderSent
      );
    } catch (error) {
      console.error(
        `Failed to send 24-hour reminder for ${appointment.id}:`,
        error
      );
    }
  }
};