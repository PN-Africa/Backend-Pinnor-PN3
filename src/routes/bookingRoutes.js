
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
 *     description: Book as a guest or registered user with a valid Supabase Bearer token.
 *     tags: [Bookings]
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
 * /api/bookings/reschedule:
 *   patch:
 *     summary: Reschedule a guest appointment
 *     description: Reschedules using the booking reference, patient email, and new slot.
 *     tags: [Bookings]
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
 *               newSlotId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Appointment rescheduled successfully
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Booking not found
 *       409:
 *         description: New slot unavailable or rescheduling not allowed
 */
router.patch("/reschedule", rescheduleGuestBooking);

/**
 * @swagger
 * /api/bookings/cancel:
 *   patch:
 *     summary: Cancel a guest appointment
 *     description: Cancels using the booking reference and patient email. No token required.
 *     tags: [Bookings]
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
 *                 example: PIN-A1B2C3D4
 *               patientEmail:
 *                 type: string
 *                 format: email
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

/**
 * @swagger
 * /api/bookings/{reference}:
 *   get:
 *     summary: Look up a booking
 *     description: Retrieves a booking using its reference and patient email.
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *         example: PIN-A1B2C3D4
 *       - in: query
 *         name: patientEmail
 *         required: true
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

export default router;
