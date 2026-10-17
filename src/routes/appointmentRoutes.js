import express from "express";

import {
  createBookingController,
  getAppointmentsController,
  getAppointmentByIdController,
  cancelAppointmentController,
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
 *     description: Appointment booking and admin management
 */

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Book an appointment automatically
 *     description: Books an available slot on a first-come, first-served basis without manual confirmation.
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
 *         description: Slot is no longer available
 */
router.post(
  "/",
  validate(createBookingSchema),
  createBookingController
);

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Get all appointments
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
 *     summary: Get appointment by ID
 *     tags:
 *       - Appointments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Appointment UUID
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
 * /api/appointments/{id}/cancel:
 *   patch:
 *     summary: Cancel an appointment
 *     tags:
 *       - Appointments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Appointment UUID
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
 *     tags:
 *       - Appointments
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Appointment UUID
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