import { z } from "zod";

export const createBookingSchema = z.object({
  slotId: z.string().uuid({
    message: "Invalid slotId UUID format"
  }),

  patientName: z.string()
    .min(2, {
      message: "Name must be at least 2 characters"
    })
    .trim(),

  patientEmail: z.string()
    .email({
      message: "Invalid email address format"
    })
    .trim()
    .toLowerCase(),

  patientPhone: z.string()
    .min(7, {
      message: "Invalid phone number"
    })
    .trim(),

  patientMessage: z.string()
    .trim()
    .max(500, {
      message: "Message cannot exceed 500 characters"
    })
    .optional()
});

export const lookupBookingSchema = z.object({
  bookingReference: z.string()
    .min(6, {
      message: "Invalid booking reference"
    })
    .trim()
    .toUpperCase(),

  patientEmail: z.string()
    .email({
      message: "Invalid email address format"
    })
    .trim()
    .toLowerCase()
});

export const rescheduleBookingSchema = z.object({
  bookingReference: z.string()
    .min(6, {
      message: "Invalid booking reference"
    })
    .trim()
    .toUpperCase(),

  patientEmail: z.string()
    .email({
      message: "Invalid email address format"
    })
    .trim()
    .toLowerCase(),

  newSlotId: z.string().uuid({
    message: "Invalid newSlotId UUID format"
  })
});

export const cancelBookingSchema = z.object({
  bookingReference: z.string()
    .min(6, {
      message: "Invalid booking reference"
    })
    .trim()
    .toUpperCase(),

  patientEmail: z.string()
    .email({
      message: "Invalid email address format"
    })
    .trim()
    .toLowerCase()
});