
import { supabase } from "../config/supabase.js";

const appointmentFields =
  "id, provider_id, service_id, slot_id, user_id, patient_name, patient_email, patient_phone, patient_message, appointment_date, start_time, end_time, status, booking_reference, reminder_48h_sent, reminder_24h_sent, created_at, updated_at";

const createError = (message, statusCode = 500) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const normalizeEmail = (email) =>
  String(email || "").trim().toLowerCase();

const getAppointment = async (appointmentId) => {
  const { data, error } = await supabase
    .from("appointments")
    .select(appointmentFields)
    .eq("id", appointmentId)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    throw createError("Appointment not found", 404);
  }

  return data;
};

const getAppointmentDetails = async (appointment) => {
  const [providerResult, serviceResult] = await Promise.all([
    supabase
      .from("providers")
      .select("name")
      .eq("id", appointment.provider_id)
      .maybeSingle(),

    supabase
      .from("services")
      .select("name")
      .eq("id", appointment.service_id)
      .maybeSingle()
  ]);

  if (providerResult.error) {
    console.error("Provider lookup failed:", providerResult.error.message);
  }

  if (serviceResult.error) {
    console.error("Service lookup failed:", serviceResult.error.message);
  }

  return {
    ...appointment,
    provider_name: providerResult.data?.name || "Not specified",
    service_name: serviceResult.data?.name || "Not specified"
  };
};

const cancelAppointmentAtomically = async (appointment) => {
  const { data, error } = await supabase.rpc(
    "cancel_appointment_atomic",
    {
      p_booking_reference: appointment.booking_reference,
      p_patient_email: appointment.patient_email
    }
  );

  if (error) throw error;

  if (!data?.success) {
    const errorCode = data?.error;

    const messages = {
      APPOINTMENT_NOT_FOUND: "Appointment not found.",
      APPOINTMENT_ALREADY_CANCELLED:
        "Appointment has already been cancelled.",
      APPOINTMENT_NOT_CANCELLABLE:
        "This appointment cannot be cancelled."
    };

    throw createError(
      messages[errorCode] ||
        errorCode ||
        "Appointment cancellation failed.",
      errorCode === "APPOINTMENT_NOT_FOUND" ? 404 : 409
    );
  }

  return getAppointment(data.appointment_id);
};

const updateAppointmentStatus = async (
  appointmentId,
  newStatus,
  allowedStatuses
) => {
  const appointment = await getAppointment(appointmentId);

  if (!allowedStatuses.includes(appointment.status)) {
    throw createError(
      `Appointment cannot be changed from ${appointment.status} to ${newStatus}`,
      409
    );
  }

  const { data, error } = await supabase
    .from("appointments")
    .update({
      status: newStatus,
      updated_at: new Date().toISOString()
    })
    .eq("id", appointmentId)
    .eq("status", appointment.status)
    .select(appointmentFields)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    throw createError(
      "Appointment status changed before this update could be completed.",
      409
    );
  }

  return data;
};

export const createBooking = async ({
  slotId,
  patientName,
  patientEmail,
  patientPhone,
  patientMessage,
  userId
}) => {
  const { data, error } = await supabase.rpc("create_booking", {
    p_slot_id: slotId,
    p_patient_name: patientName,
    p_patient_email: patientEmail,
    p_patient_phone: patientPhone,
    p_patient_message: patientMessage ?? null,
    p_user_id: userId ?? null
  });

  if (error) {
    if (error.code === "P0001" || error.code === "23505") {
      throw createError(
        "This appointment slot is no longer available. Please select another slot.",
        409
      );
    }

    throw error;
  }

  if (!data) {
    throw createError("Appointment booking failed.");
  }

  return getAppointmentDetails(data);
};

export const getAppointments = async ({
  providerId,
  serviceId,
  status,
  date
} = {}) => {
  let query = supabase
    .from("appointments")
    .select(appointmentFields)
    .order("appointment_date", { ascending: true });

  if (providerId) query = query.eq("provider_id", providerId);
  if (serviceId) query = query.eq("service_id", serviceId);
  if (status) query = query.eq("status", status);
  if (date) query = query.eq("appointment_date", date);

  const { data, error } = await query;

  if (error) throw error;

  return data || [];
};

export const getPatientAppointments = async (email) => {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail) {
    throw createError("Authenticated user email is required.", 401);
  }

  const { data, error } = await supabase
    .from("appointments")
    .select(`
      ${appointmentFields},
      provider:providers (
        name,
        specialty
      ),
      service:services (
        name,
        duration_minutes
      )
    `)
    .eq("patient_email", normalizedEmail)
    .order("appointment_date", { ascending: true });

  if (error) throw error;

  return data || [];
};

export const getAppointmentById = async (appointmentId) => {
  return getAppointment(appointmentId);
};

export const cancelAppointment = async (appointmentId) => {
  const appointment = await getAppointment(appointmentId);
  const cancelled = await cancelAppointmentAtomically(appointment);

  return getAppointmentDetails(cancelled);
};

export const cancelPatientAppointment = async (
  appointmentId,
  patientEmail
) => {
  const appointment = await getAppointment(appointmentId);

  if (
    !normalizeEmail(patientEmail) ||
    normalizeEmail(appointment.patient_email) !== normalizeEmail(patientEmail)
  ) {
    throw createError(
      "You are not authorized to cancel this appointment.",
      403
    );
  }

  const cancelled = await cancelAppointmentAtomically(appointment);

  return getAppointmentDetails(cancelled);
};

export const completeAppointment = async (appointmentId) => {
  return updateAppointmentStatus(
    appointmentId,
    "completed",
    ["confirmed"]
  );
};

export const getAppointmentByReference = async (
  reference,
  patientEmail
) => {
  const normalizedReference = String(reference || "")
    .trim()
    .toUpperCase();

  const normalizedEmail = normalizeEmail(patientEmail);

  if (!normalizedReference || !normalizedEmail) {
    return null;
  }

  const { data, error } = await supabase
    .from("appointments")
    .select(appointmentFields)
    .eq("booking_reference", normalizedReference)
    .eq("patient_email", normalizedEmail)
    .maybeSingle();

  if (error) throw error;

  return data;
};
