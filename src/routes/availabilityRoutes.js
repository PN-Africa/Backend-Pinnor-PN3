import express from "express";

import {
  createAvailabilitySlotController,
  getAvailabilitySlotsController,
  getAvailabilitySlotByIdController,
  updateAvailabilitySlotController,
  deleteAvailabilitySlotController,
  publishAvailabilitySlotController,
  unpublishAvailabilitySlotController,
  blockAvailabilitySlotController
} from "../controllers/availabilityController.js";

import {
  requireAuth,
  requireAdmin
} from "../middleware/auth.js";

import { validate } from "../middleware/validate.js";
import { validateUUID } from "../middleware/validateUUID.js";

import {
  createAvailabilitySchema,
  updateAvailabilitySchema
} from "../validators/availabilityValidators.js";

const router = express.Router();

/**
 * @swagger
 * /api/availability:
 *   get:
 *     summary: Get published, available appointment slots
 *     tags: [Availability]
 *     responses:
 *       200:
 *         description: Availability slots retrieved successfully
 */
router.get("/", getAvailabilitySlotsController);

/**
 * @swagger
 * /api/availability/{id}:
 *   get:
 *     summary: Get availability slot by ID
 *     tags: [Availability]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Availability slot retrieved successfully
 *       400:
 *         description: Invalid availability slot ID
 *       404:
 *         description: Slot not found
 */
router.get(
  "/:id",
  validateUUID("id"),
  getAvailabilitySlotByIdController
);

/**
 * @swagger
 * /api/availability:
 *   post:
 *     summary: Create availability slot
 *     tags: [Availability]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Availability slot created successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 */
router.post(
  "/",
  requireAuth,
  requireAdmin,
  validate(createAvailabilitySchema),
  createAvailabilitySlotController
);

/**
 * @swagger
 * /api/availability/{id}:
 *   patch:
 *     summary: Update availability slot
 *     tags: [Availability]
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
 *         description: Availability slot updated successfully
 *       400:
 *         description: Invalid availability slot ID or request data
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: Slot not found
 *       409:
 *         description: Slot conflicts with existing availability
 */
router.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  validateUUID("id"),
  validate(updateAvailabilitySchema),
  updateAvailabilitySlotController
);

/**
 * @swagger
 * /api/availability/{id}/publish:
 *   patch:
 *     summary: Publish availability slot
 *     tags: [Availability]
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
 *         description: Availability slot published successfully
 *       400:
 *         description: Invalid availability slot ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: Slot not found
 *       409:
 *         description: Slot cannot be published
 */
router.patch(
  "/:id/publish",
  requireAuth,
  requireAdmin,
  validateUUID("id"),
  publishAvailabilitySlotController
);

/**
 * @swagger
 * /api/availability/{id}/unpublish:
 *   patch:
 *     summary: Unpublish availability slot
 *     description: Hide a slot from public availability without blocking it.
 *     tags: [Availability]
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
 *         description: Availability slot unpublished successfully
 *       400:
 *         description: Invalid availability slot ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: Slot not found
 *       409:
 *         description: Slot cannot be unpublished
 */
router.patch(
  "/:id/unpublish",
  requireAuth,
  requireAdmin,
  validateUUID("id"),
  unpublishAvailabilitySlotController
);

/**
 * @swagger
 * /api/availability/{id}/block:
 *   patch:
 *     summary: Block availability slot
 *     tags: [Availability]
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
 *         description: Availability slot blocked successfully
 *       400:
 *         description: Invalid availability slot ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: Slot not found
 *       409:
 *         description: Booked slot cannot be blocked
 */
router.patch(
  "/:id/block",
  requireAuth,
  requireAdmin,
  validateUUID("id"),
  blockAvailabilitySlotController
);

/**
 * @swagger
 * /api/availability/{id}:
 *   delete:
 *     summary: Delete availability slot
 *     tags: [Availability]
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
 *         description: Availability slot deleted successfully
 *       400:
 *         description: Invalid availability slot ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 *       404:
 *         description: Slot not found
 *       409:
 *         description: Booked slot cannot be deleted
 */
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  validateUUID("id"),
  deleteAvailabilitySlotController
);

export default router;