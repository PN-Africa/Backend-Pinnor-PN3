
import { supabase } from "../config/supabase.js";

const publicBookingFields = [
  "id",
  "provider_id",
  "service_id",
  "slot_id",
  "patient_name",
  "patient_email",
  "patient_phone",
  "patient_message",
  "appointment_date",
  "start_time",
  "end_time",
  "status",
  "booking_reference",
  "created_at",
  "updated_at"
].join(", ");

const normalizeEmail = (email) =>
  String(email || "").trim().toLowerCase();

const normalizeReference = (reference) =>
  String(reference || "").trim().toUpperCase();

const addBookingNames = async (booking) => {
  const [providerResult, serviceResult] = await Promise.all([
    supabase
      .from("providers")
      .select("name")
      .eq("id", booking.provider_id)
      .maybeSingle(),

    supabase
      .from("services")
      .select("name")
      .eq("id", booking.service_id)
      .maybeSingle()
  ]);

  if (providerResult.error) {
    console.error("Provider name lookup failed:", providerResult.error.message);
  }

  if (serviceResult.error) {
    console.error("Service name lookup failed:", serviceResult.error.message);
  }

  return {
    ...booking,
    provider_name: providerResult.data?.name ?? null,
    service_name: serviceResult.data?.name ?? null
  };
};

const throwMappedError = (
  errorCode,
  errorMap,
  fallbackMessage
) => {
  const result = errorMap[errorCode] ?? {
    message: fallbackMessage,
    statusCode: 500
  };

  const error = new Error(result.message);
  error.statusCode = result.statusCode;

  if (errorCode) error.code = errorCode;

  throw error;
};

const getBookingById = async (appointmentId) => {
  const { data, error } = await supabase
    .from("appointments")
    .select(publicBookingFields)
    .eq("id", appointmentId)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    const notFoundError = new Error("Booking not found");
    notFoundError.statusCode = 404;
    throw notFoundError;
  }

  return addBookingNames(data);
};

export const createBooking = async ({
  slotId,
  patientName,
  patientEmail,
  patientPhone,
  patientMessage,
  userId = null
}) => {
  const { data, error } = await supabase.rpc("create_booking", {
    p_slot_id: slotId,
    p_patient_name: patientName,
    p_patient_email: normalizeEmail(patientEmail),
    p_patient_phone: patientPhone,
    p_patient_message: patientMessage ?? null,
    p_user_id: userId
  });

  if (error) throw error;

  if (!data?.id) {
    throw new Error(
      "Booking was created without returning appointment details"
    );
  }

  return getBookingById(data.id);
};

export const getBookingByReference = async (
  bookingReference,
  patientEmail
) => {
  const reference = normalizeReference(bookingReference);
  const email = normalizeEmail(patientEmail);

  if (!reference || !email) {
    const error = new Error("Booking reference and email are required");
    error.statusCode = 400;
    throw error;
  }

  const { data, error } = await supabase
    .from("appointments")
    .select(publicBookingFields)
    .eq("booking_reference", reference)
    .eq("patient_email", email)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    const notFoundError = new Error("Booking not found");
    notFoundError.statusCode = 404;
    throw notFoundError;
  }

  return addBookingNames(data);
};

export const rescheduleBooking = async (
  bookingReference,
  patientEmail,
  newSlotId
) => {
  const { data, error } = await supabase.rpc(
    "reschedule_appointment_atomic",
    {
      p_booking_reference: normalizeReference(bookingReference),
      p_patient_email: normalizeEmail(patientEmail),
      p_new_slot_id: newSlotId
    }
  );

  if (error) throw error;

  const errorMap = {
    APPOINTMENT_NOT_FOUND: {
      message: "Booking not found",
      statusCode: 404
    },
    NEW_SLOT_UNAVAILABLE: {
      message: "The selected slot is no longer available",
      statusCode: 409
    },
    PAST_APPOINTMENT_SLOT: {
      message: "Appointments cannot be rescheduled to a past slot",
      statusCode: 409
    }
  };

  if (!data || data.success !== true) {
    throwMappedError(
      data?.error,
      errorMap,
      "Appointment rescheduling failed"
    );
  }

  if (!data.appointment_id) {
    throw new Error(
      "Rescheduling succeeded without returning an appointment ID"
    );
  }

  return getBookingById(data.appointment_id);
};

export const cancelBooking = async (
  bookingReference,
  patientEmail
) => {
  const { data, error } = await supabase.rpc(
    "cancel_appointment_atomic",
    {
      p_booking_reference: normalizeReference(bookingReference),
      p_patient_email: normalizeEmail(patientEmail)
    }
  );

  if (error) throw error;

  const errorMap = {
    APPOINTMENT_NOT_FOUND: {
      message: "Booking not found",
      statusCode: 404
    },
    APPOINTMENT_ALREADY_CANCELLED: {
      message: "Appointment is already cancelled",
      statusCode: 409
    },
    APPOINTMENT_NOT_CANCELLABLE: {
      message: "This appointment cannot be cancelled",
      statusCode: 409
    }
  };

  if (!data || data.success !== true) {
    throwMappedError(
      data?.error,
      errorMap,
      "Appointment cancellation failed"
    );
  }

  if (!data.appointment_id) {
    throw new Error(
      "Cancellation succeeded without returning an appointment ID"
    );
  }

  return getBookingById(data.appointment_id);
};
