
import { z } from "zod";

const bookingReferenceSchema = z.string()
  .trim()
  .toUpperCase()
  .regex(/^PIN-[A-Z0-9]{8}$/, {
    message: "Invalid booking reference format"
  });

const patientEmailSchema = z.string()
  .trim()
  .toLowerCase()
  .email({
    message: "Invalid email address format"
  });

export const createBookingSchema = z.object({
  slotId: z.string().uuid({
    message: "Invalid slotId UUID format"
  }),

  patientName: z.string()
    .trim()
    .min(2, {
      message: "Name must be at least 2 characters"
    })
    .max(255, {
      message: "Name cannot exceed 255 characters"
    }),

  patientEmail: patientEmailSchema,

  patientPhone: z.string()
    .trim()
    .min(7, {
      message: "Invalid phone number"
    })
    .max(50, {
      message: "Phone number cannot exceed 50 characters"
    }),

  patientMessage: z.string()
    .trim()
    .max(500, {
      message: "Message cannot exceed 500 characters"
    })
    .nullable()
    .optional()
}).strict();

export const lookupBookingSchema = z.object({
  bookingReference: bookingReferenceSchema,
  patientEmail: patientEmailSchema
}).strict();

export const rescheduleBookingSchema = z.object({
  bookingReference: bookingReferenceSchema,
  patientEmail: patientEmailSchema,
  newSlotId: z.string().uuid({
    message: "Invalid newSlotId UUID format"
  })
}).strict();

export const cancelBookingSchema = z.object({
  bookingReference: bookingReferenceSchema,
  patientEmail: patientEmailSchema
}).strict();
