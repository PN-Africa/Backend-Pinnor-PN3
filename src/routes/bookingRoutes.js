import express from "express";

import {
  createGuestBooking,
  lookupGuestBooking,
  rescheduleGuestBooking,
  cancelGuestBooking
} from "../controllers/bookingController.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Bookings
 *   description: Guest appointment booking
 */

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a guest appointment booking
 *     tags: [Bookings]
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
 *                 example: 08012345678
 *               patientMessage:
 *                 type: string
 *                 example: I would like to discuss my symptoms.
 *     responses:
 *       201:
 *         description: Appointment booked successfully
 *       400:
 *         description: Validation failed
 *       409:
 *         description: Appointment slot is no longer available
 */
router.post("/", createGuestBooking);

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
 *     responses:
 *       200:
 *         description: Appointment rescheduled successfully
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Booking not found
 *       409:
 *         description: New appointment slot is unavailable
 */
router.patch("/reschedule", rescheduleGuestBooking);

/**
 * @swagger
 * /api/bookings/cancel:
 *   patch:
 *     summary: Cancel a guest appointment
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
 *                 example: patient@example.com
 *     responses:
 *       200:
 *         description: Appointment cancelled successfully
 *       400:
 *         description: Validation failed
 *       404:
 *         description: Booking not found
 *       409:
 *         description: Booking cannot be cancelled
 */
router.patch("/cancel", cancelGuestBooking);

export default router;