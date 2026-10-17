import { z } from "zod";

export const createProviderSchema = z.object({
  userId: z.string().uuid({
    message: "Invalid userId UUID format"
  }).optional(),

  name: z.string()
    .trim()
    .min(2, {
      message: "Provider name must be at least 2 characters"
    })
    .max(150, {
      message: "Provider name cannot exceed 150 characters"
    }),

  specialty: z.string()
    .trim()
    .min(2, {
      message: "Specialty must be at least 2 characters"
    })
    .max(150, {
      message: "Specialty cannot exceed 150 characters"
    }),

  bio: z.string()
    .trim()
    .max(2000, {
      message: "Bio cannot exceed 2000 characters"
    })
    .nullable()
    .optional(),

  email: z.string()
    .email({
      message: "Invalid email address format"
    })
    .trim()
    .toLowerCase(),

  phone: z.string()
    .trim()
    .min(7, {
      message: "Invalid phone number"
    })
    .max(30, {
      message: "Phone number cannot exceed 30 characters"
    }),

  status: z.enum(["active", "inactive"])
    .default("active")
});

export const updateProviderSchema = z.object({
  userId: z.string().uuid({
    message: "Invalid userId UUID format"
  }).optional(),

  name: z.string()
    .trim()
    .min(2, {
      message: "Provider name must be at least 2 characters"
    })
    .max(150, {
      message: "Provider name cannot exceed 150 characters"
    })
    .optional(),

  specialty: z.string()
    .trim()
    .min(2, {
      message: "Specialty must be at least 2 characters"
    })
    .max(150, {
      message: "Specialty cannot exceed 150 characters"
    })
    .optional(),

  bio: z.string()
    .trim()
    .max(2000, {
      message: "Bio cannot exceed 2000 characters"
    })
    .nullable()
    .optional(),

  email: z.string()
    .email({
      message: "Invalid email address format"
    })
    .trim()
    .toLowerCase()
    .optional(),

  phone: z.string()
    .trim()
    .min(7, {
      message: "Invalid phone number"
    })
    .max(30, {
      message: "Phone number cannot exceed 30 characters"
    })
    .optional()
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