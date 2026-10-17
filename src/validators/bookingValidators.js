import { z } from "zod";

export const createBookingSchema = z.object({
slotId: z.string().uuid(),
patientName: z.string().trim().min(2).max(100),
patientEmail: z.string().email(),
patientPhone: z.string().trim().min(7).max(20),
patientMessage: z.string().trim().max(1000).nullable().optional()
});