import { z } from "zod";

export const createServiceSchema = z.object({
  providerId: z.string().uuid({
    message: "Invalid providerId UUID format"
  }),

  name: z.string()
    .trim()
    .min(2, {
      message: "Service name must be at least 2 characters"
    })
    .max(150, {
      message: "Service name cannot exceed 150 characters"
    }),

  description: z.string()
    .trim()
    .max(1000, {
      message: "Description cannot exceed 1000 characters"
    })
    .nullable()
    .optional(),

  durationMinutes: z.number()
    .int()
    .min(1, {
      message: "Duration must be at least 1 minute"
    })
    .max(1440, {
      message: "Duration cannot exceed 1440 minutes"
    }),

  status: z.enum(["active", "inactive"])
    .default("active")
});

export const updateServiceSchema = z.object({
  providerId: z.string().uuid({
    message: "Invalid providerId UUID format"
  }).optional(),

  name: z.string()
    .trim()
    .min(2, {
      message: "Service name must be at least 2 characters"
    })
    .max(150, {
      message: "Service name cannot exceed 150 characters"
    })
    .optional(),

  description: z.string()
    .trim()
    .max(1000, {
      message: "Description cannot exceed 1000 characters"
    })
    .nullable()
    .optional(),

  durationMinutes: z.number()
    .int()
    .min(1, {
      message: "Duration must be at least 1 minute"
    })
    .max(1440, {
      message: "Duration cannot exceed 1440 minutes"
    })
    .optional()
}).refine(
  (data) => Object.keys(data).length > 0,
  {
    message: "At least one field is required"
  }
);

export const serviceStatusSchema = z.object({
  status: z.enum(["active", "inactive"], {
    message: "Status must be active or inactive"
  })
});