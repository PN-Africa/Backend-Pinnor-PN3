import { supabase } from "../config/supabase.js";

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "UNAUTHORIZED",
        message: "Authentication token is required"
      });
    }

    const token = authHeader.slice(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "UNAUTHORIZED",
        message: "Authentication token is required"
      });
    }

    const {
      data: { user },
      error
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({
        success: false,
        error: "INVALID_TOKEN",
        message: "Invalid or expired authentication token"
      });
    }

    req.user = user;

    next();
  } catch (error) {
    next(error);
  }
};

export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        error: "UNAUTHORIZED",
        message: "Authentication is required"
      });
    }

    const { data: profile, error } = await supabase
      .from("user_profiles")
      .select("role")
      .eq("id", req.user.id)
      .maybeSingle();

    if (error) {
      return next(error);
    }

    if (!profile) {
      return res.status(403).json({
        success: false,
        error: "FORBIDDEN",
        message: "User profile not found"
      });
    }

    if (profile.role !== "admin") {
      return res.status(403).json({
        success: false,
        error: "FORBIDDEN",
        message: "Admin privileges required"
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};