
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

const addressSchema = z.string()
  .trim()
  .max(500, {
    message: "Address cannot exceed 500 characters"
  })
  .nullable()
  .optional();

const descriptionSchema = z.string()
  .trim()
  .max(3000, {
    message: "Description cannot exceed 3000 characters"
  })
  .nullable()
  .optional();

const websiteSchema = z.string()
  .trim()
  .url({
    message: "Invalid website URL"
  })
  .max(500, {
    message: "Website URL cannot exceed 500 characters"
  })
  .nullable()
  .optional();

const latitudeSchema = z.number()
  .min(-90, {
    message: "Latitude must be between -90 and 90"
  })
  .max(90, {
    message: "Latitude must be between -90 and 90"
  })
  .nullable()
  .optional();

const longitudeSchema = z.number()
  .min(-180, {
    message: "Longitude must be between -180 and 180"
  })
  .max(180, {
    message: "Longitude must be between -180 and 180"
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
  address: addressSchema,
  description: descriptionSchema,
  website: websiteSchema,
  latitude: latitudeSchema,
  longitude: longitudeSchema,
  status: z.enum(["active", "inactive"]).default("active")
});

export const updateProviderSchema = z.object({
  userId: userIdSchema.optional(),
  name: nameSchema.optional(),
  specialty: specialtySchema.optional(),
  bio: bioSchema,
  email: emailSchema.optional(),
  phone: phoneSchema.optional(),
  address: addressSchema,
  description: descriptionSchema,
  website: websiteSchema,
  latitude: latitudeSchema,
  longitude: longitudeSchema
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
