
import {
  sendCancellationConfirmationEmail
} from "../services/emailService.js";

import {
  createBooking,
  getAppointments,
  getAppointmentById,
  getAppointmentByReference,
  getPatientAppointments,
  cancelAppointment,
  cancelPatientAppointment,
  completeAppointment
} from "../repositories/appointmentRepository.js";

export const createBookingController = async (req, res, next) => {
  try {
    const appointment = await createBooking(req.body);

    res.status(201).json({
      success: true,
      message: "Appointment booked successfully",
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointmentsController = async (req, res, next) => {
  try {
    const appointments = await getAppointments({
      providerId: req.query.providerId,
      serviceId: req.query.serviceId,
      status: req.query.status,
      date: req.query.date
    });

    res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

export const getMyAppointmentsController = async (req, res, next) => {
  try {
    const email = req.user?.email;

    if (!email) {
      return res.status(401).json({
        success: false,
        error: "UNAUTHORIZED",
        message: "Authenticated user email is unavailable"
      });
    }

    const appointments = await getPatientAppointments(email);

    return res.status(200).json({
      success: true,
      data: appointments
    });
  } catch (error) {
    next(error);
  }
};

export const lookupAppointmentController = async (req, res, next) => {
  try {
    const reference = String(req.params.reference || "")
      .trim()
      .toUpperCase();

    if (!reference) {
      return res.status(400).json({
        success: false,
        error: "MISSING_REFERENCE",
        message: "Booking reference is required"
      });
    }

    const appointment = await getAppointmentByReference(reference);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: "APPOINTMENT_NOT_FOUND",
        message: "No appointment found with that booking reference"
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: appointment.id,
        booking_reference: appointment.booking_reference,
        appointment_date: appointment.appointment_date,
        start_time: appointment.start_time,
        end_time: appointment.end_time,
        status: appointment.status
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointmentByIdController = async (req, res, next) => {
  try {
    const appointment = await getAppointmentById(req.params.id);

    res.status(200).json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

export const cancelAppointmentController = async (req, res, next) => {
  try {
    const appointment = await cancelAppointment(req.params.id);

    try {
      await sendCancellationConfirmationEmail(appointment);
    } catch (emailError) {
      console.error(
        "Cancellation email failed:",
        emailError.message
      );
    }

    res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

export const cancelMyAppointmentController = async (req, res, next) => {
  try {
    const email = req.user?.email;

    if (!email) {
      return res.status(401).json({
        success: false,
        error: "UNAUTHORIZED",
        message: "Authenticated user email is unavailable"
      });
    }

    const appointment = await cancelPatientAppointment(
      req.params.id,
      email
    );

    try {
      await sendCancellationConfirmationEmail(appointment);
    } catch (emailError) {
      console.error(
        "Cancellation email failed:",
        emailError.message
      );
    }

    return res.status(200).json({
      success: true,
      message: "Appointment cancelled successfully",
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

export const completeAppointmentController = async (req, res, next) => {
  try {
    const appointment = await completeAppointment(req.params.id);

    res.status(200).json({
      success: true,
      message: "Appointment marked as completed",
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};
