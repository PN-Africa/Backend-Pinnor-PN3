
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
 *   name: Bookings
 *   description: Guest and registered patient appointment booking
 */

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create an appointment booking
 *     description: Book as a guest without an access token, or as a registered user with a valid Supabase Bearer token.
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
 *                 example: Kelvin Agho
 *               patientEmail:
 *                 type: string
 *                 format: email
 *                 example: patient@example.com
 *               patientPhone:
 *                 type: string
 *                 example: "08012345678"
 *               patientMessage:
 *                 type: string
 *                 example: I would like to discuss my symptoms.
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
 *         description: Booking found
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
 *     tags: [Bookings]
 */
router.patch("/reschedule", rescheduleGuestBooking);

/**
 * @swagger
 * /api/bookings/cancel:
 *   patch:
 *     summary: Cancel a guest appointment
 *     tags: [Bookings]
 */
router.patch("/cancel", cancelGuestBooking);

export default router;
