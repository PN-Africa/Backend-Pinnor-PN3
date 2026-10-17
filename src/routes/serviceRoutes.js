import express from "express";

import {
  getServicesController,
  getServiceByIdController,
  createServiceController,
  updateServiceController,
  updateServiceStatusController,
  deleteServiceController
} from "../controllers/serviceController.js";

import {
  requireAuth,
  requireAdmin
} from "../middleware/auth.js";

import { validate } from "../middleware/validate.js";

import {
  createServiceSchema,
  updateServiceSchema,
  serviceStatusSchema
} from "../validators/serviceValidators.js";

const router = express.Router();

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Get all active services
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: Services retrieved successfully
 */
router.get("/", getServicesController);

/**
 * @swagger
 * /api/services/{id}:
 *   get:
 *     summary: Get service by ID
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Service retrieved successfully
 *       404:
 *         description: Service not found
 */
router.get("/:id", getServiceByIdController);

/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Create a service
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Service created successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 */
router.post(
  "/",
  requireAuth,
  requireAdmin,
  validate(createServiceSchema),
  createServiceController
);

/**
 * @swagger
 * /api/services/{id}:
 *   patch:
 *     summary: Update a service
 *     tags: [Services]
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
 *         description: Service updated successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 */
router.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  validate(updateServiceSchema),
  updateServiceController
);

/**
 * @swagger
 * /api/services/{id}/status:
 *   patch:
 *     summary: Update service status
 *     tags: [Services]
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
 *         description: Service status updated successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 */
router.patch(
  "/:id/status",
  requireAuth,
  requireAdmin,
  validate(serviceStatusSchema),
  updateServiceStatusController
);

/**
 * @swagger
 * /api/services/{id}:
 *   delete:
 *     summary: Delete a service
 *     tags: [Services]
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
 *         description: Service deleted successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 */
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  deleteServiceController
);

export default router;