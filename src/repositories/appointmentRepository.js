import { randomBytes } from "node:crypto";
import { supabase } from "../config/supabase.js";

const appointmentFields =
"id, provider_id, service_id, slot_id, patient_name, patient_email, patient_phone, patient_message, appointment_date, start_time, end_time, status, booking_reference, reminder_48hr, reminder_24hr, created_at, updated_at";

const getAppointment = async (appointmentId) => {
const { data, error } = await supabase
.from("appointments")
.select(appointmentFields)
.eq("id", appointmentId)
.single();

if (error || !data) {
const err = new Error("Appointment not found");
err.statusCode = 404;
throw err;
}

return data;
};

const updateAppointmentStatus = async (
appointmentId,
newStatus,
allowedStatuses
) => {
const appointment = await getAppointment(appointmentId);

if (!allowedStatuses.includes(appointment.status)) {
const err = new Error(
  `Appointment cannot be changed from ${appointment.status} to ${newStatus}`
);
err.statusCode = 409;
throw err;
}

const { data, error } = await supabase
.from("appointments")
.update({
status: newStatus,
updated_at: new Date().toISOString()
})
.eq("id", appointmentId)
.select(appointmentFields)
.single();

if (error) {
throw error;
}

return data;
};

export const createBooking = async ({
slotId,
patientName,
patientEmail,
patientPhone,
patientMessage
}) => {
const bookingReference = `PIN-${randomBytes(4) .toString("hex") .toUpperCase()}`;

const { data, error } = await supabase.rpc("book_appointment", {
p_slot_id: slotId,
p_patient_name: patientName,
p_patient_email: patientEmail,
p_patient_phone: patientPhone,
p_patient_message: patientMessage ?? null,
p_booking_reference: bookingReference
});

if (error) {
if (error.code === "P0001" || error.code === "23505") {
const err = new Error(
"This appointment slot is no longer available. Please select another slot."
);
err.statusCode = 409;
throw err;
}

throw error;

}

if (!data) {
const err = new Error("Appointment booking failed");
err.statusCode = 500;
throw err;
}

return data;
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

if (providerId) {
query = query.eq("provider_id", providerId);
}

if (serviceId) {
query = query.eq("service_id", serviceId);
}

if (status) {
query = query.eq("status", status);
}

if (date) {
query = query.eq("appointment_date", date);
}

const { data, error } = await query;

if (error) {
throw error;
}

return data;
};

export const getAppointmentById = async (appointmentId) => {
return getAppointment(appointmentId);
};

export const cancelAppointment = async (appointmentId) => {
const { data, error } = await supabase.rpc("cancel_appointment", {
p_appointment_id: appointmentId
});

if (error) {
if (error.code === "P0001") {
const err = new Error(
"Appointment not found or cannot be cancelled."
);
err.statusCode = 409;
throw err;
}

throw error;

}

if (!data) {
const err = new Error("Appointment cancellation failed");
err.statusCode = 500;
throw err;
}

return data;
};

export const completeAppointment = async (appointmentId) => {
return updateAppointmentStatus(
appointmentId,
"completed",
["confirmed"]
);
};