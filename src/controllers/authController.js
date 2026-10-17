
import { supabaseAuth } from "../config/supabaseAuth.js";
import { supabase } from "../config/supabase.js";

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabaseAuth.auth.signUp({
      email,
      password
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

    const { error: profileError } = await supabase
      .from("user_profiles")
      .upsert(
        {
          id: data.user.id,
          role: "provider"
        },
        { onConflict: "id" }
      );

   if (profileError) {
  console.error("Registration profile creation failed:", {
    code: profileError.code,
    message: profileError.message,
    details: profileError.details,
    hint: profileError.hint
  });

  return next(profileError);
}

    return res.status(201).json({
      success: true,
      message: data.session
        ? "Registration successful"
        : "Registration successful. Check your email to confirm your account.",
      data: {
        user: {
          id: data.user.id,
          email: data.user.email
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
    const { email, password } = req.body;

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

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: data.user.id,
          email: data.user.email
        },
        session: data.session
      }
    });
  } catch (error) {
    next(error);
  }
};
