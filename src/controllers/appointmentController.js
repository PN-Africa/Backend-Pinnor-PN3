import {
createBooking,
getAppointments,
getAppointmentById,
cancelAppointment,
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

res.status(200).json({
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