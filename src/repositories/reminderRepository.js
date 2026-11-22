
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

const reminderConfig = {
  24: {
    sentColumn: "reminder_24h_sent",
    claimColumn: "reminder_24h_claimed_until"
  },
  48: {
    sentColumn: "reminder_48h_sent",
    claimColumn: "reminder_48h_claimed_until"
  }
};

const getAppointmentsForReminder = async (hours) => {
  const config = reminderConfig[hours];

  if (!config) {
    throw new Error("Invalid reminder interval");
  }

  const { data: claims, error: claimError } =
    await supabase.rpc("claim_due_reminders", {
      p_hours: hours,
      p_window_minutes: 30,
      p_lease_minutes: 15,
      p_batch_size: 100
    });

  if (claimError) throw claimError;
  if (!claims?.length) return [];

  const appointmentIds = claims.map(
    (claim) => claim.appointment_id
  );

  const { data, error } = await supabase
    .from("appointments")
    .select(reminderFields)
    .in("id", appointmentIds)
    .eq("status", "confirmed")
    .eq(config.sentColumn, false);

  if (error) throw error;

  const claimMap = new Map(
    claims.map((claim) => [
      claim.appointment_id,
      claim.claimed_until
    ])
  );

  return (data || []).map((appointment) => ({
    ...appointment,
    [config.claimColumn]: claimMap.get(appointment.id)
  }));
};

const updateReminder = async (
  appointmentId,
  claimedUntil,
  hours,
  sent
) => {
  const config = reminderConfig[hours];

  if (!config || !claimedUntil) {
    throw new Error("Valid reminder claim is required");
  }

  const updates = {
    [config.claimColumn]: null,
    updated_at: new Date().toISOString()
  };

  if (sent) {
    updates[config.sentColumn] = true;
  }

  const { data, error } = await supabase
    .from("appointments")
    .update(updates)
    .eq("id", appointmentId)
    .eq(config.claimColumn, claimedUntil)
    .eq(config.sentColumn, false)
    .select("id")
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    throw new Error(
      `Reminder claim expired or changed for appointment ${appointmentId}`
    );
  }
};

export const getAppointmentsFor48HourReminder = () =>
  getAppointmentsForReminder(48);

export const getAppointmentsFor24HourReminder = () =>
  getAppointmentsForReminder(24);

export const mark48HourReminderSent = (id, claim) =>
  updateReminder(id, claim, 48, true);

export const mark24HourReminderSent = (id, claim) =>
  updateReminder(id, claim, 24, true);

export const release48HourReminderClaim = (id, claim) =>
  updateReminder(id, claim, 48, false);

export const release24HourReminderClaim = (id, claim) =>
  updateReminder(id, claim, 24, false);
