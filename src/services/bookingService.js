
import {
  createBooking as createBookingRepository,
  getBookingByReference as getBookingByReferenceRepository,
  rescheduleBooking as rescheduleBookingRepository,
  cancelBooking as cancelBookingRepository
} from "../repositories/bookingRepository.js";

import {
  sendBookingConfirmationEmail,
  sendRescheduleConfirmationEmail,
  sendCancellationConfirmationEmail
} from "./emailService.js";

const sendNotificationSafely = async (sendEmail, booking, action) => {
  try {
    await sendEmail(booking);
  } catch (error) {
    console.error(
      `${action} email failed for ${
        booking.booking_reference || booking.id
      }:`,
      error.message
    );
  }
};

export const createBooking = async (
  {
    slotId,
    patientName,
    patientEmail,
    patientPhone,
    patientMessage
  },
  userId = null
) => {
  const booking = await createBookingRepository({
    slotId,
    patientName,
    patientEmail,
    patientPhone,
    patientMessage,
    userId
  });

  await sendNotificationSafely(
    sendBookingConfirmationEmail,
    booking,
    "Booking confirmation"
  );

  return booking;
};

export const getBookingByReference = async (
  bookingReference,
  patientEmail
) => {
  return getBookingByReferenceRepository(
    bookingReference,
    patientEmail
  );
};

export const rescheduleBooking = async (
  bookingReference,
  patientEmail,
  newSlotId
) => {
  const booking = await rescheduleBookingRepository(
    bookingReference,
    patientEmail,
    newSlotId
  );

  await sendNotificationSafely(
    sendRescheduleConfirmationEmail,
    booking,
    "Rescheduling confirmation"
  );

  return booking;
};

export const cancelBooking = async (
  bookingReference,
  patientEmail
) => {
  const bookingBeforeCancellation =
    await getBookingByReferenceRepository(
      bookingReference,
      patientEmail
    );

  const cancellation =
    await cancelBookingRepository(
      bookingReference,
      patientEmail
    );

  await sendNotificationSafely(
    sendCancellationConfirmationEmail,
    bookingBeforeCancellation,
    "Cancellation confirmation"
  );

  return cancellation;
};
