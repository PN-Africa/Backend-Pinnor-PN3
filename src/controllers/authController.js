
import { supabaseAuth } from "../config/supabaseAuth.js";
import { supabase } from "../config/supabase.js";

const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("role, full_name, email, phone, avatar_url")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

const formatUser = (user, profile = {}) => ({
  id: user.id,
  email: profile.email || user.email,
  full_name: profile.full_name || user.user_metadata?.full_name || null,
  phone: profile.phone || user.user_metadata?.phone || null,
  avatar_url: profile.avatar_url || user.user_metadata?.avatar_url || null,
  role: profile.role || null
});

export const register = async (req, res, next) => {
  try {
    const { fullName, email, phone, password } = req.body;

    const normalizedName = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        error: "INVALID_EMAIL",
        message: "Please provide a valid email address"
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        error: "WEAK_PASSWORD",
        message: "Password must be at least 8 characters long"
      });
    }

    const { data, error } = await supabaseAuth.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          full_name: normalizedName,
          phone: normalizedPhone
        }
      }
    });

    if (error) {
      return res.status(400).json({
        success: false,
        error: "REGISTRATION_FAILED",
        message: error.message
      });
    }

    if (!data.user) {
      return res.status(400).json({
        success: false,
        error: "REGISTRATION_FAILED",
        message: "Unable to create account"
      });
    }

    return res.status(201).json({
      success: true,
      message: data.session
        ? "Registration successful"
        : "Registration successful. Check your email to confirm your account.",
      data: {
        user: {
          id: data.user.id,
          full_name: normalizedName,
          email: data.user.email,
          phone: normalizedPhone
        },
        session: data.session
      }
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const { password } = req.body;

    const { data, error } = await supabaseAuth.auth.signInWithPassword({
      email,
      password
    });

    if (error || !data.user || !data.session) {
      return res.status(401).json({
        success: false,
        error: "INVALID_CREDENTIALS",
        message: "Invalid email or password"
      });
    }

    const profile = await getProfile(data.user.id);

    if (!profile?.role) {
      return res.status(403).json({
        success: false,
        error: "PROFILE_NOT_FOUND",
        message: "User profile or role not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: formatUser(data.user, profile),
        session: data.session
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const profile = await getProfile(req.user.id);

    if (!profile?.role) {
      return res.status(404).json({
        success: false,
        error: "PROFILE_NOT_FOUND",
        message: "User profile or role not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        user: formatUser(req.user, profile)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const verifySignupOtp = async (req, res, next) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const token = req.body.token.trim();

    const { data, error } = await supabaseAuth.auth.verifyOtp({
      email,
      token,
      type: "signup"
    });

    if (error || !data.user) {
      return res.status(400).json({
        success: false,
        error: "OTP_VERIFICATION_FAILED",
        message: error?.message || "Unable to verify email"
      });
    }

    const profile = await getProfile(data.user.id);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: {
        user: formatUser(data.user, profile || {}),
        session: data.session
      }
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : "";

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "UNAUTHORIZED",
        message: "Authentication token is required"
      });
    }

    const { error } = await supabase.auth.admin.signOut(token, "local");

    if (error) {
      return res.status(400).json({
        success: false,
        error: "LOGOUT_FAILED",
        message: "Unable to complete logout"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Logout successful"
    });
  } catch (error) {
    next(error);
  }
};

export const googleLogin = async (req, res, next) => {
  try {
    const redirectTo = process.env.GOOGLE_OAUTH_REDIRECT_URL;

    if (!redirectTo) {
      return res.status(500).json({
        success: false,
        error: "GOOGLE_REDIRECT_NOT_CONFIGURED",
        message: "Google OAuth redirect URL is not configured"
      });
    }

    const { data, error } = await supabaseAuth.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        skipBrowserRedirect: true
      }
    });

    if (error || !data?.url) {
      return res.status(400).json({
        success: false,
        error: "GOOGLE_LOGIN_FAILED",
        message: error?.message || "Unable to generate Google authentication URL"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Google authentication URL generated successfully",
      data: { url: data.url }
    });
  } catch (error) {
    next(error);
  }
};
