
import express from "express";

import {
  createGuestBooking,
  lookupGuestBooking,
  rescheduleGuestBooking,
  cancelGuestBooking
} from "../controllers/bookingController.js";

import { optionalAuth } from "../middleware/auth.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Bookings
 *     description: Guest and registered patient appointment booking
 */

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create an appointment booking
 *     description: Book as a guest without an access token, or as a registered user with a valid Supabase Bearer token.
 *     tags:
 *       - Bookings
 *     security:
 *       - bearerAuth: []
 *       - {}
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
 *         description: Validation failed
 *       401:
 *         description: Invalid or expired access token
 *       409:
 *         description: Appointment slot is unavailable
 */
router.post("/", optionalAuth, createGuestBooking);

/**
 * @swagger
 * /api/bookings/{reference}:
 *   get:
 *     summary: Look up a guest booking
 *     description: Retrieves a booking using its reference and the patient's email address.
 *     tags:
 *       - Bookings
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         description: Booking reference
 *         schema:
 *           type: string
 *         example: PIN-A1B2C3D4
 *       - in: query
 *         name: patientEmail
 *         required: true
 *         description: Email address used when creating the booking
 *         schema:
 *           type: string
 *           format: email
 *     responses:
 *       200:
 *         description: Booking retrieved successfully
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Booking not found
 */
router.get("/:reference", lookupGuestBooking);

/**
 * @swagger
 * /api/bookings/reschedule:
 *   patch:
 *     summary: Reschedule a guest appointment
 *     description: Reschedules an appointment using its booking reference, patient email, and a new availability slot.
 *     tags:
 *       - Bookings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingReference
 *               - patientEmail
 *               - newSlotId
 *             properties:
 *               bookingReference:
 *                 type: string
 *                 example: PIN-A1B2C3D4
 *               patientEmail:
 *                 type: string
 *                 format: email
 *                 example: patient@example.com
 *               newSlotId:
 *                 type: string
 *                 format: uuid
 *                 description: UUID of the new availability slot
 *     responses:
 *       200:
 *         description: Appointment rescheduled successfully
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Booking not found
 *       409:
 *         description: New appointment slot is unavailable or rescheduling is not allowed
 */
router.patch("/reschedule", rescheduleGuestBooking);

/**
 * @swagger
 * /api/bookings/cancel:
 *   patch:
 *     summary: Cancel a guest appointment
 *     description: Cancels an appointment using the booking reference and the patient's registered booking email. No authentication token is required by this route.
 *     tags:
 *       - Bookings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingReference
 *               - patientEmail
 *             properties:
 *               bookingReference:
 *                 type: string
 *                 description: Reference generated when the appointment was booked
 *                 example: PIN-A1B2C3D4
 *               patientEmail:
 *                 type: string
 *                 format: email
 *                 description: Email address used when creating the booking
 *                 example: patient@example.com
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Booking not found
 *       409:
 *         description: Appointment cannot be cancelled
 */
router.patch("/cancel", cancelGuestBooking);

export default router;
