
import { supabase } from "../config/supabase.js";

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

  if (providerResult.error) throw providerResult.error;
  if (serviceResult.error) throw serviceResult.error;

  return {
    ...booking,
    provider_name: providerResult.data?.name ?? null,
    service_name: serviceResult.data?.name ?? null
  };
};

const throwMappedError = (errorCode, errorMap, fallbackMessage) => {
  const result = errorMap[errorCode] ?? {
    message: fallbackMessage,
    statusCode: 500
  };

  const error = new Error(result.message);
  error.statusCode = result.statusCode;

  if (errorCode) {
    error.code = errorCode;
  }

  throw error;
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
    p_patient_email: patientEmail,
    p_patient_phone: patientPhone,
    p_patient_message: patientMessage || null,
    p_user_id: userId
  });

  if (error) throw error;

  if (!data) {
    throw new Error(
      "Booking was created without returning appointment details"
    );
  }

  return addBookingNames(data);
};

export const getBookingByReference = async (
  bookingReference,
  patientEmail
) => {
  const { data, error } = await supabase
    .from("appointments")
    .select("*")
    .eq("booking_reference", bookingReference)
    .eq("patient_email", patientEmail)
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    const error = new Error("Booking not found");
    error.statusCode = 404;
    throw error;
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
      p_booking_reference: bookingReference,
      p_patient_email: patientEmail,
      p_new_slot_id: newSlotId
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
    APPOINTMENT_NOT_RESCHEDULABLE: {
      message: "This appointment cannot be rescheduled",
      statusCode: 409
    },
    NEW_SLOT_UNAVAILABLE: {
      message: "The selected slot is no longer available",
      statusCode: 409
    },
    SLOT_UNAVAILABLE: {
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
      "Rescheduling succeeded but no appointment ID was returned"
    );
  }

  const { data: appointment, error: fetchError } = await supabase
    .from("appointments")
    .select("*")
    .eq("id", data.appointment_id)
    .single();

  if (fetchError) throw fetchError;

  return addBookingNames(appointment);
};

export const cancelBooking = async (
  bookingReference,
  patientEmail
) => {
  const { data, error } = await supabase.rpc(
    "cancel_appointment_atomic",
    {
      p_booking_reference: bookingReference,
      p_patient_email: patientEmail
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

  return data;
};
