import crypto from "crypto";

import {
    getAvailableSlot,
    createAppointment,
    markSlotAsBooked,
    getAppointmentByReference
} from "../repositories/booking.repository.js";

export const bookAppointment = async ({
    slotId,
    patientName,
    patientEmail,
    patientPhone
}) => {
    const slot = await getAvailableSlot(slotId);

    if (!slot) {
        throw new Error("Appointment slot is not available");
    }

    const bookingReference =
        `PIN-${crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;

    const appointment = await createAppointment({
        provider_id: slot.provider_id,
        service_id: slot.service_id,
        slot_id: slot.id,
        patient_name: patientName,
        patient_email: patientEmail,
        patient_phone: patientPhone,
        appointment_date: slot.start_time,
        start_time: slot.start_time,
        end_time: slot.end_time,
        status: "pending",
        booking_reference: bookingReference
    });

    await markSlotAsBooked(slot.id);

    return appointment;
};

export const getBookingByReference = async (bookingReference) => {
    return await getAppointmentByReference(bookingReference);
};