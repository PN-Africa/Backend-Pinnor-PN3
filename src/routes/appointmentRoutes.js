
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

const validateAppointmentId = (req, res, next) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  if (!uuidRegex.test(req.params.id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid appointment ID."
    });
  }

  next();
};

const validateLookupQuery = (req, res, next) => {
  const email = String(req.query.email || "").trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: "A valid patient email address is required."
    });
  }

  req.query.email = email.toLowerCase();
  next();
};

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
 *     description: Books an available appointment slot automatically on a first-come, first-served basis.
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
 *               patientName:
 *                 type: string
 *               patientEmail:
 *                 type: string
 *                 format: email
 *               patientPhone:
 *                 type: string
 *               patientMessage:
 *                 type: string
 *                 nullable: true
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
 *     description: Retrieves appointment information using the booking reference and patient email.
 *     tags:
 *       - Appointments
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           format: email
 *     responses:
 *       200:
 *         description: Appointment retrieved successfully
 *       400:
 *         description: Invalid reference or email
 *       404:
 *         description: Appointment not found
 */
router.get(
  "/lookup/:reference",
  validateLookupQuery,
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
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Appointment retrieved successfully
 *       400:
 *         description: Invalid appointment ID
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
  validateAppointmentId,
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
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
 *       400:
 *         description: Invalid appointment ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Patient is not authorized
 *       404:
 *         description: Appointment not found
 *       409:
 *         description: Appointment cannot be cancelled
 */
router.patch(
  "/:id/my-cancel",
  requireAuth,
  validateAppointmentId,
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
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
 *       400:
 *         description: Invalid appointment ID
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
  validateAppointmentId,
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
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Appointment marked as completed
 *       400:
 *         description: Invalid appointment ID
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
  validateAppointmentId,
  completeAppointmentController
);

export default router;
