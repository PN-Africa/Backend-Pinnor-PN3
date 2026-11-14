
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
 *   description: User registration, login, Google OAuth and authentication management
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account using Supabase Authentication.
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
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePassword123
 *     responses:
 *       201:
 *         description: Registration successful. Email confirmation may be required.
 *       400:
 *         description: Registration failed or validation error
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Log in a user
 *     description: Authenticates a user and returns their profile and session.
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
 *                 example: admin@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: SecurePassword123
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
 *     description: Generates a Google OAuth authentication URL through Supabase. The frontend should redirect the user to the returned URL.
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: Google authentication URL generated successfully
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
 *     description: Retrieves the profile of the currently authenticated user.
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
 *     description: Verifies a user's email using the signup OTP.
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
 *                 example: admin@example.com
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
 *     description: Signs out the current user using their Bearer access token.
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *       400:
 *         description: Logout failed
 *       401:
 *         description: Authentication token required
 */

// Register
router.post("/register", validateBody(registerSchema), register);

// Login
router.post("/login", validateBody(loginSchema), login);

// Google OAuth login
router.get("/google", googleLogin);

// Get current authenticated user
router.get("/me", requireAuth, getCurrentUser);

// Verify signup OTP
router.post("/verify-otp", verifySignupOtp);

// Logout
router.post("/logout", requireAuth, logout);

export default router;
