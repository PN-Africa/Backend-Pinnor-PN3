
export const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      console.error("[VALIDATION FAILED]", {
        method: req.method,
        path: req.originalUrl,
        submittedFields: Object.keys(req.body || {}),
        errors: result.error.flatten().fieldErrors
      });

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors
      });
    }

    req.body = result.data;

    next();
  };
};
