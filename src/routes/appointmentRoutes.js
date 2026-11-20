
import express from "express";

import {
  createBookingController,
  getAppointmentsController,
  getMyAppointmentsController,
  lookupAppointmentController,
  getAppointmentByIdController,
  cancelAppointmentController,
  cancelMyAppointmentController,
  completeAppointmentController
} from "../controllers/appointmentController.js";

import {
  requireAuth,
  requireAdmin
} from "../middleware/auth.js";

import { validate } from "../middleware/validate.js";
import { createBookingSchema } from "../validators/bookingValidators.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Appointments
 *     description: Guest booking, patient appointments, and admin appointment management
 */

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Book an appointment
 *     description: Books an available appointment slot automatically on a first-come, first-served basis. No manual confirmation is required.
 *     tags:
 *       - Appointments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slotId
 *               - patientName
 *               - patientEmail
 *               - patientPhone
 *             properties:
 *               slotId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the selected availability slot
 *               patientName:
 *                 type: string
 *                 description: Patient's full name
 *               patientEmail:
 *                 type: string
 *                 format: email
 *                 description: Patient's email address
 *               patientPhone:
 *                 type: string
 *                 description: Patient's phone number
 *               patientMessage:
 *                 type: string
 *                 nullable: true
 *                 description: Optional message for the provider
 *     responses:
 *       201:
 *         description: Appointment booked successfully
 *       400:
 *         description: Invalid booking details
 *       409:
 *         description: Selected slot is no longer available
 */
router.post(
  "/",
  validate(createBookingSchema),
  createBookingController
);

/**
 * @swagger
 * /api/appointments/lookup/{reference}:
 *   get:
 *     summary: Look up a guest appointment
 *     description: Retrieves limited appointment information using a booking reference. Authentication is not required.
 *     tags:
 *       - Appointments
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         description: Appointment booking reference
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Appointment retrieved successfully
 *       404:
 *         description: Appointment not found
 */
router.get(
  "/lookup/:reference",
  lookupAppointmentController
);

/**
 * @swagger
 * /api/appointments/mine:
 *   get:
 *     summary: Get the authenticated patient's appointments
 *     tags:
 *       - Appointments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Patient appointments retrieved successfully
 *       401:
 *         description: Authentication required
 */
router.get(
  "/mine",
  requireAuth,
  getMyAppointmentsController
);

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Get all appointments
 *     description: Retrieves appointments with optional provider, service, status, and date filters. Admin access is required.
 *     tags:
 *       - Appointments
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 */
router.get(
  "/",
  requireAuth,
  requireAdmin,
  getAppointmentsController
);

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Get an appointment by ID
 *     description: Retrieves appointment details. Admin access is required.
 *     tags:
 *       - Appointments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: UUID of the appointment
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Appointment retrieved successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: Appointment not found
 */
router.get(
  "/:id",
  requireAuth,
  requireAdmin,
  getAppointmentByIdController
);

/**
 * @swagger
 * /api/appointments/{id}/my-cancel:
 *   patch:
 *     summary: Cancel the authenticated patient's appointment
 *     description: Cancels an appointment only when it belongs to the authenticated patient's email address.
 *     tags:
 *       - Appointments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: UUID of the appointment to cancel
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Patient is not authorized to cancel this appointment
 *       404:
 *         description: Appointment not found
 *       409:
 *         description: Appointment cannot be cancelled
 */
router.patch(
  "/:id/my-cancel",
  requireAuth,
  cancelMyAppointmentController
);

/**
 * @swagger
 * /api/appointments/{id}/cancel:
 *   patch:
 *     summary: Cancel an appointment as an administrator
 *     description: Allows an authenticated administrator to cancel an appointment.
 *     tags:
 *       - Appointments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: UUID of the appointment to cancel
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: Appointment not found
 *       409:
 *         description: Appointment cannot be cancelled
 */
router.patch(
  "/:id/cancel",
  requireAuth,
  requireAdmin,
  cancelAppointmentController
);

/**
 * @swagger
 * /api/appointments/{id}/complete:
 *   patch:
 *     summary: Mark an appointment as completed
 *     description: Allows an administrator to mark a confirmed appointment as completed.
 *     tags:
 *       - Appointments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: UUID of the appointment
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Appointment marked as completed
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: Appointment not found
 *       409:
 *         description: Appointment cannot be completed
 */
router.patch(
  "/:id/complete",
  requireAuth,
  requireAdmin,
  completeAppointmentController
);

export default router;
