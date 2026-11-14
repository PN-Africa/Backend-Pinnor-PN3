
import Joi from "joi";

export const registerSchema = Joi.object({
  fullName: Joi.string().trim().min(2).required(),
  email: Joi.string().trim().email().required(),
  phone: Joi.string().trim().min(7).required(),
  password: Joi.string().min(8).required()
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().required()
});
