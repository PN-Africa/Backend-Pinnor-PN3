
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

const sendNotificationSafely = (sendEmail, booking, action) => {
  Promise.resolve()
    .then(() => sendEmail(booking))
    .catch((error) => {
      console.error(`${action} email failed`, {
        bookingReference: booking?.booking_reference,
        bookingId: booking?.id,
        message: error.message
      });
    });
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

  sendNotificationSafely(
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

  sendNotificationSafely(
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

  const cancellation = await cancelBookingRepository(
    bookingReference,
    patientEmail
  );

  sendNotificationSafely(
    sendCancellationConfirmationEmail,
    bookingBeforeCancellation,
    "Cancellation confirmation"
  );

  return cancellation;
};
