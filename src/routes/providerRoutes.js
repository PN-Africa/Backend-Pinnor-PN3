
import express from "express";
import { z } from "zod";

import {
  getProvidersController,
  getAllProvidersController,
  getProviderByIdController,
  createProviderController,
  updateProviderController,
  updateProviderStatusController,
  deleteProviderController
} from "../controllers/providerController.js";

import {
  createProviderSchema,
  updateProviderSchema,
  updateProviderStatusSchema
} from "../validators/providerValidators.js";

import { validate } from "../middleware/validate.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = express.Router();

const providerIdSchema = z.string().uuid({
  message: "Invalid provider ID"
});

const validateProviderId = (req, res, next) => {
  const result = providerIdSchema.safeParse(req.params.id);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: "Invalid provider ID",
      errors: result.error.flatten()
    });
  }

  next();
};

/**
 * @swagger
 * tags:
 *   - name: Providers
 *     description: Provider management
 */

/**
 * @swagger
 * /api/providers:
 *   get:
 *     summary: Get active providers
 *     tags: [Providers]
 *     responses:
 *       200:
 *         description: Active providers retrieved successfully
 */
router.get("/", getProvidersController);

/**
 * @swagger
 * /api/providers/admin/all:
 *   get:
 *     summary: Get all providers including inactive providers
 *     description: Admin-only endpoint for managing and reactivating providers.
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All providers retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.get(
  "/admin/all",
  requireAuth,
  requireAdmin,
  getAllProvidersController
);

/**
 * @swagger
 * /api/providers/{id}:
 *   get:
 *     summary: Get provider by ID
 *     tags: [Providers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Provider retrieved successfully
 *       400:
 *         description: Invalid provider ID
 *       404:
 *         description: Provider not found
 */
router.get(
  "/:id",
  validateProviderId,
  getProviderByIdController
);

/**
 * @swagger
 * /api/providers:
 *   post:
 *     summary: Create a provider
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - specialty
 *               - email
 *               - phone
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               specialty:
 *                 type: string
 *               bio:
 *                 type: string
 *                 nullable: true
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *                 nullable: true
 *               description:
 *                 type: string
 *                 nullable: true
 *               website:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *               latitude:
 *                 type: number
 *                 minimum: -90
 *                 maximum: 90
 *                 nullable: true
 *               longitude:
 *                 type: number
 *                 minimum: -180
 *                 maximum: 180
 *                 nullable: true
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       201:
 *         description: Provider created successfully
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 */
router.post(
  "/",
  requireAuth,
  requireAdmin,
  validate(createProviderSchema),
  createProviderController
);

/**
 * @swagger
 * /api/providers/{id}:
 *   patch:
 *     summary: Update provider details
 *     description: Updates provider information including address, description, website and map coordinates.
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               name:
 *                 type: string
 *               specialty:
 *                 type: string
 *               bio:
 *                 type: string
 *                 nullable: true
 *               email:
 *                 type: string
 *                 format: email
 *               phone:
 *                 type: string
 *               address:
 *                 type: string
 *                 nullable: true
 *               description:
 *                 type: string
 *                 nullable: true
 *               website:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *               latitude:
 *                 type: number
 *                 minimum: -90
 *                 maximum: 90
 *                 nullable: true
 *               longitude:
 *                 type: number
 *                 minimum: -180
 *                 maximum: 180
 *                 nullable: true
 *     responses:
 *       200:
 *         description: Provider updated successfully
 *       400:
 *         description: Invalid ID or request body
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Provider not found
 */
router.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  validateProviderId,
  validate(updateProviderSchema),
  updateProviderController
);

/**
 * @swagger
 * /api/providers/{id}/status:
 *   patch:
 *     summary: Activate or deactivate a provider
 *     tags: [Providers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *     responses:
 *       200:
 *         description: Provider status updated successfully
 *       400:
 *         description: Invalid provider ID or status
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Provider not found
 */
router.patch(
  "/:id/status",
  requireAuth,
  requireAdmin,
  validateProviderId,
  validate(updateProviderStatusSchema),
  updateProviderStatusController
);

/**
 * @swagger
 * /api/providers/{id}:
 *   delete:
 *     summary: Delete a provider
 *     tags: [Providers]
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
 *         description: Provider deleted successfully
 *       400:
 *         description: Invalid provider ID
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Admin access required
 *       404:
 *         description: Provider not found
 *       409:
 *         description: Provider has associated records and cannot be deleted
 */
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  validateProviderId,
  deleteProviderController
);

export default router;
