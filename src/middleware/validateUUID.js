import { z } from "zod";

export const validateUUID = (paramName = "id") => {
return (req, res, next) => {
const result = z.string().uuid().safeParse(req.params[paramName]);

if (!result.success) {
  return res.status(400).json({
    success: false,
    error: "VALIDATION_ERROR",
    message: `Invalid ${paramName}: must be a valid UUID`
  });
}

next();

};
};
