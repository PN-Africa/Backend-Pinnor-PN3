
import { Router } from "express";

import {
  registerSchema,
  loginSchema
} from "../validators/authValidators.js";

import {
  register,
  login,
  getCurrentUser,
  verifySignupOtp,
  logout,
  googleLogin
} from "../controllers/authController.js";

import { requireAuth } from "../middleware/auth.js";

const router = Router();

const validateBody = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json({
      success: false,
      error: "VALIDATION_ERROR",
      message: "Validation failed",
      details: error.details.map((detail) => detail.message)
    });
  }

  req.body = value;
  next();
};

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User registration, login and authentication management
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fullName
 *               - email
 *               - phone
 *               - password
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               phone:
 *                 type: string
 *                 example: "08012345678"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 8
 *     responses:
 *       201:
 *         description: Registration successful
 *       400:
 *         description: Validation or registration failed
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid email or password
 *       403:
 *         description: User profile or role not found
 */

/**
 * @swagger
 * /api/auth/google:
 *   get:
 *     summary: Initiate Google login
 *     description: Generates a Google OAuth URL through Supabase. The frontend redirects the user to the returned URL.
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Google authentication URL generated
 *       400:
 *         description: Google authentication failed
 *       500:
 *         description: Google OAuth redirect URL is not configured
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user retrieved successfully
 *       401:
 *         description: Authentication required
 *       404:
 *         description: User profile or role not found
 */

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify signup email OTP
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - token
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               token:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: OTP verification failed
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Log out authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       400:
 *         description: Logout failed
 *       401:
 *         description: Authentication required
 */

// Register
router.post("/register", validateBody(registerSchema), register);

// Login
router.post("/login", validateBody(loginSchema), login);

// Google OAuth
router.get("/google", googleLogin);

// Current authenticated user
router.get("/me", requireAuth, getCurrentUser);

// Verify signup OTP
router.post("/verify-otp", verifySignupOtp);

// Logout
router.post("/logout", requireAuth, logout);

export default router;
