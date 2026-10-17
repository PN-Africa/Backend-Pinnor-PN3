import {
  createBooking as createBookingRepository,
  getBookingByReference as getBookingByReferenceRepository,
  rescheduleBooking as rescheduleBookingRepository,
  cancelBooking as cancelBookingRepository
} from "../repositories/bookingRepository.js";

export const createBooking = async ({
  slotId,
  patientName,
  patientEmail,
  patientPhone,
  patientMessage
}) => {
  return await createBookingRepository({
    slotId,
    patientName,
    patientEmail,
    patientPhone,
    patientMessage
  });
};

export const getBookingByReference = async (
  bookingReference,
  patientEmail
) => {
  return await getBookingByReferenceRepository(
    bookingReference,
    patientEmail
  );
};

export const rescheduleBooking = async (
  bookingReference,
  patientEmail,
  newSlotId
) => {
  return await rescheduleBookingRepository(
    bookingReference,
    patientEmail,
    newSlotId
  );
};

export const cancelBooking = async (
  bookingReference,
  patientEmail
) => {
  return await cancelBookingRepository(
    bookingReference,
    patientEmail
  );
};