
import { Router } from "express";
import {
  registerSchema,
  loginSchema
} from "../validators/authValidators.js";
import {
  register,
  login
} from "../controllers/authController.js";

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

router.post("/register", validateBody(registerSchema), register);
router.post("/login", validateBody(loginSchema), login);

export default router;
