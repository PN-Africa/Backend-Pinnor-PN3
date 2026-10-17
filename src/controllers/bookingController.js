import {
  createBooking,
  getBookingByReference,
  rescheduleBooking,
  cancelBooking
} from "../services/bookingService.js";

import {
  createBookingSchema,
  lookupBookingSchema,
  rescheduleBookingSchema,
  cancelBookingSchema
} from "../validators/appointmentValidators.js";

export const createGuestBooking = async (req, res, next) => {
  try {
    const validation = createBookingSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten().fieldErrors
      });
    }

    const booking = await createBooking(validation.data);

    return res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

export const lookupGuestBooking = async (req, res, next) => {
  try {
    const validation = lookupBookingSchema.safeParse({
      bookingReference: req.params.reference,
      patientEmail: req.query.patientEmail
    });

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten().fieldErrors
      });
    }

    const booking = await getBookingByReference(
      validation.data.bookingReference,
      validation.data.patientEmail
    );

    return res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

export const rescheduleGuestBooking = async (req, res, next) => {
  try {
    const validation = rescheduleBookingSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten().fieldErrors
      });
    }

    const booking = await rescheduleBooking(
      validation.data.bookingReference,
      validation.data.patientEmail,
      validation.data.newSlotId
    );

    return res.status(200).json({
      success: true,
      message: "Appointment rescheduled successfully",
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

export const cancelGuestBooking = async (req, res, next) => {
  try {
    const validation = cancelBookingSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: validation.error.flatten().fieldErrors
      });
    }

    const booking = await cancelBooking(
      validation.data.bookingReference,
      validation.data.patientEmail
    );

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      data: booking
    });
  } catch (error) {
    next(error);
  }
};