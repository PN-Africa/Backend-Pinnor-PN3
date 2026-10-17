import express from "express";

import {
  getProvidersController,
  getProviderByIdController,
  createProviderController,
  updateProviderController,
  updateProviderStatusController,
  deleteProviderController
} from "../controllers/providerController.js";

import {
  requireAuth,
  requireAdmin
} from "../middleware/auth.js";

import { validate } from "../middleware/validate.js";

import {
  createProviderSchema,
  updateProviderSchema,
  providerStatusSchema
} from "../validators/providerValidators.js";

const router = express.Router();

/**
 * @swagger
 * /api/providers:
 *   get:
 *     summary: Get all active providers
 *     tags: [Providers]
 *     responses:
 *       200:
 *         description: Providers retrieved successfully
 */
router.get("/", getProvidersController);

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
 *       404:
 *         description: Provider not found
 */
router.get("/:id", getProviderByIdController);

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
 *     responses:
 *       201:
 *         description: Provider created successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
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
 *     summary: Update a provider
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
 *         description: Provider updated successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 */
router.patch(
  "/:id",
  requireAuth,
  requireAdmin,
  validate(updateProviderSchema),
  updateProviderController
);

/**
 * @swagger
 * /api/providers/{id}/status:
 *   patch:
 *     summary: Update provider status
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
 *         description: Provider status updated successfully
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 */
router.patch(
  "/:id/status",
  requireAuth,
  requireAdmin,
  validate(providerStatusSchema),
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
 *       401:
 *         description: Authentication required
 *       403:
 *         description: Admin privileges required
 */
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  deleteProviderController
);

export default router;