
import { supabase } from "../config/supabase.js";

const unauthorized = (res, error, message) => {
  return res.status(401).json({
    success: false,
    error,
    message
  });
};

const verifyToken = async (token) => {
  const {
    data: { user },
    error
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    return null;
  }

  return user;
};

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return unauthorized(
        res,
        "UNAUTHORIZED",
        "Authentication token is required"
      );
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      return unauthorized(
        res,
        "UNAUTHORIZED",
        "Authentication token is required"
      );
    }

    const user = await verifyToken(token);

    if (!user) {
      return unauthorized(
        res,
        "INVALID_TOKEN",
        "Invalid or expired authentication token"
      );
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // No token means the patient is booking as a guest.
    if (!authHeader) {
      return next();
    }

    if (!authHeader.startsWith("Bearer ")) {
      return unauthorized(
        res,
        "UNAUTHORIZED",
        "Invalid authorization header"
      );
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      return unauthorized(
        res,
        "UNAUTHORIZED",
        "Authentication token is required"
      );
    }

    const user = await verifyToken(token);

    if (!user) {
      return unauthorized(
        res,
        "INVALID_TOKEN",
        "Invalid or expired authentication token"
      );
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return unauthorized(
        res,
        "UNAUTHORIZED",
        "Authentication is required"
      );
    }

    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", req.user.id)
      .maybeSingle();

    if (error) {
      return next(error);
    }

    if (!profile || profile.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "FORBIDDEN",
        message: "Admin privileges required"
      });
    }

    return next();
  } catch (error) {
    return next(error);
  }
};
