
import { z } from "zod";

const userIdSchema = z.string().uuid({
  message: "Invalid userId UUID format"
});

const nameSchema = z.string()
  .trim()
  .min(2, {
    message: "Provider name must be at least 2 characters"
  })
  .max(150, {
    message: "Provider name cannot exceed 150 characters"
  });

const specialtySchema = z.string()
  .trim()
  .min(2, {
    message: "Specialty must be at least 2 characters"
  })
  .max(150, {
    message: "Specialty cannot exceed 150 characters"
  });

const bioSchema = z.string()
  .trim()
  .max(2000, {
    message: "Bio cannot exceed 2000 characters"
  })
  .nullable()
  .optional();

const emailSchema = z.string()
  .trim()
  .email({
    message: "Invalid email address format"
  })
  .max(255, {
    message: "Email cannot exceed 255 characters"
  })
  .toLowerCase();

const phoneSchema = z.string()
  .trim()
  .min(7, {
    message: "Invalid phone number"
  })
  .max(30, {
    message: "Phone number cannot exceed 30 characters"
  });

export const createProviderSchema = z.object({
  userId: userIdSchema.optional(),
  name: nameSchema,
  specialty: specialtySchema,
  bio: bioSchema,
  email: emailSchema,
  phone: phoneSchema,
  status: z.enum(["active", "inactive"]).default("active")
});

export const updateProviderSchema = z.object({
  userId: userIdSchema.optional(),
  name: nameSchema.optional(),
  specialty: specialtySchema.optional(),
  bio: bioSchema,
  email: emailSchema.optional(),
  phone: phoneSchema.optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "At least one field is required"
  }
);

export const providerStatusSchema = z.object({
  status: z.enum(["active", "inactive"], {
    message: "Status must be active or inactive"
  })
});

export const updateProviderStatusSchema = providerStatusSchema;
