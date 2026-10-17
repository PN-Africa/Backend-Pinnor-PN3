import { supabase } from "../config/supabase.js";

const reminderFields = `
  id,
  patient_name,
  patient_email,
  appointment_date,
  start_time,
  booking_reference,
  provider:providers (
    name
  ),
  service:services (
    name
  )
`;

export const getAppointmentsFor48HourReminder = async () => {
  const now = new Date();
  const target = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  const start = new Date(target.getTime() - 30 * 60 * 1000);
  const end = new Date(target.getTime() + 30 * 60 * 1000);

  const { data, error } = await supabase
    .from("appointments")
    .select(reminderFields)
    .eq("status", "confirmed")
    .eq("reminder_48hr", false)
    .gte("start_time", start.toISOString())
    .lt("start_time", end.toISOString());

  if (error) {
    throw error;
  }

  return data;
};

export const getAppointmentsFor24HourReminder = async () => {
  const now = new Date();
  const target = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const start = new Date(target.getTime() - 30 * 60 * 1000);
  const end = new Date(target.getTime() + 30 * 60 * 1000);

  const { data, error } = await supabase
    .from("appointments")
    .select(reminderFields)
    .eq("status", "confirmed")
    .eq("reminder_24hr", false)
    .gte("start_time", start.toISOString())
    .lt("start_time", end.toISOString());

  if (error) {
    throw error;
  }

  return data;
};

export const mark48HourReminderSent = async (appointmentId) => {
  const { error } = await supabase
    .from("appointments")
    .update({
      reminder_48hr: true,
      updated_at: new Date().toISOString()
    })
    .eq("id", appointmentId);

  if (error) {
    throw error;
  }
};

export const mark24HourReminderSent = async (appointmentId) => {
  const { error } = await supabase
    .from("appointments")
    .update({
      reminder_24hr: true,
      updated_at: new Date().toISOString()
    })
    .eq("id", appointmentId);

  if (error) {
    throw error;
  }
};