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
export const createBooking = async ({
  slotId,
  patientName,
  patientEmail,
  patientPhone,
  patientMessage
}) => {
  const { data, error } = await supabase.rpc("create_booking", {
    p_slot_id: slotId,
    p_patient_name: patientName,
    p_patient_email: patientEmail,
    p_patient_phone: patientPhone,
    p_patient_message: patientMessage || null
  });

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Booking was created without returning appointment details");
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

  if (error) {
    throw error;
  }

  if (!data) {
    const err = new Error("Booking not found");
    err.statusCode = 404;
    throw err;
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

  if (error) {
    throw error;
  }

  if (!data || data.success !== true) {
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

    const result = errorMap[data?.error] || {
      message: "Appointment rescheduling failed",
      statusCode: 500
    };

    const err = new Error(result.message);
    err.statusCode = result.statusCode;

    if (data?.error) {
      err.code = data.error;
    }

    throw err;
  }

  return data;
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

  if (error) {
    throw error;
  }

  if (!data || data.success !== true) {
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

    const result = errorMap[data?.error] || {
      message: "Appointment cancellation failed",
      statusCode: 500
    };

    const err = new Error(result.message);
    err.statusCode = result.statusCode;

    if (errorMap[data?.error]) {
      err.code = data.error;
    }

    throw err;
  }

  return data;
};
