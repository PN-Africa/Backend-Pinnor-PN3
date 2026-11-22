
import { z } from "zod";

export const createAvailabilitySchema = z.object({
  providerId: z.string().uuid({
    message: "Invalid providerId UUID format"
  }),

  serviceId: z.string().uuid({
    message: "Invalid serviceId UUID format"
  }),

  startTime: z.string().datetime({
    message: "Invalid startTime format"
  }),

  endTime: z.string().datetime({
    message: "Invalid endTime format"
  })
}).strict().refine(
  (data) => new Date(data.startTime) < new Date(data.endTime),
  {
    message: "End time must be later than start time",
    path: ["endTime"]
  }
);

export const updateAvailabilitySchema = z.object({
  providerId: z.string().uuid({
    message: "Invalid providerId UUID format"
  }).optional(),

  serviceId: z.string().uuid({
    message: "Invalid serviceId UUID format"
  }).optional(),

  startTime: z.string().datetime({
    message: "Invalid startTime format"
  }).optional(),

  endTime: z.string().datetime({
    message: "Invalid endTime format"
  }).optional()
}).strict()
  .refine(
    (data) => Object.keys(data).length > 0,
    {
      message: "At least one field must be provided for update"
    }
  )
  .refine(
    (data) => {
      if (!data.startTime || !data.endTime) return true;
      return new Date(data.startTime) < new Date(data.endTime);
    },
    {
      message: "End time must be later than start time",
      path: ["endTime"]
    }
  );
