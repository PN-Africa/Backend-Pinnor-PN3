
export const errorHandler = (err, req, res, next) => {
  console.error("[Global Error Handler]:", err);

  // Zod validation errors
  if (err.name === "ZodError") {
    return res.status(400).json({
      success: false,
      error: "VALIDATION_ERROR",
      message: "Validation failed",
      errors: err.flatten().fieldErrors
    });
  }

  // Supabase/PostgreSQL errors
  if (err.code) {
    switch (err.code) {
     
case "P0001":
  if (
    err.message ===
    "Appointment slot is no longer available"
  ) {
    return res.status(409).json({
      success: false,
      error: "SLOT_UNAVAILABLE",
      message: "This appointment slot is no longer available."
    });
  }

  if (err.message === "Appointment slot is in the past") {
    return res.status(409).json({
      success: false,
      error: "PAST_APPOINTMENT_SLOT",
      message: "Appointments cannot be booked in the past."
    });
  }

  break;


      case "23505":
        return res.status(409).json({
          success: false,
          error: "DUPLICATE_RESOURCE",
          message: "A record with these details already exists"
        });

      case "23503":
        return res.status(400).json({
          success: false,
          error: "INVALID_REFERENCE",
          message: "A referenced record does not exist"
        });

      case "23502":
        return res.status(400).json({
          success: false,
          error: "MISSING_REQUIRED_FIELD",
          message: "A required field is missing"
        });
    }
  }

  // Application errors
  const statusCode = err.statusCode || 500;

  return res.status(statusCode).json({
    success: false,
    error: err.statusCode
      ? err.code || getErrorCode(statusCode)
      : "INTERNAL_SERVER_ERROR",
    message:
      statusCode >= 500
        ? "An unexpected error occurred on the server."
        : err.message
  });
};

const getErrorCode = (statusCode) => {
  const errorCodes = {
    400: "BAD_REQUEST",
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    409: "CONFLICT",
    422: "UNPROCESSABLE_ENTITY"
  };

  return errorCodes[statusCode] || "REQUEST_ERROR";
};
