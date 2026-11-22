
import express from "express";
import { z } from "zod";

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

const serviceIdSchema = z.string().uuid({
  message: "Invalid service ID"
});

const validateServiceId = (req, res, next) => {
  const result = serviceIdSchema.safeParse(req.params.id);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid service ID",
      errors: result.error.flatten()
    });
  }

  next();
};

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
 *       400:
 *         description: Invalid service ID
 *       404:
 *         description: Service not found
 */
router.get(
  "/:id",
  validateServiceId,
  getServiceByIdController
);

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
 *       400:
 *         description: Validation failed
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
 *       400:
 *         description: Invalid service ID or request body
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 */
router.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  validateServiceId,
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
 *       400:
 *         description: Invalid service ID or status
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 */
router.patch(
  "/:id/status",
  requireAuth,
  requireAdmin,
  validateServiceId,
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
 *       400:
 *         description: Invalid service ID
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 */
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  validateServiceId,
  deleteServiceController
);

export default router;
