import User from "../models/user.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

// @desc    Authenticate User
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, error: "Please enter all fields" });
    }

    // Find user by email (role is automatically resolved from DB record)
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ success: false, error: "Invalid Credentials" });
    }

    // Verify password
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: "Invalid Credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || "fallback_default_jwt_secret_key_123456",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};

// @desc    Update credentials (email and/or password)
// @route   PUT /api/auth/change-credentials
// @access  Public (Simulating authenticated action using the current email)
export const changeCredentials = async (req, res) => {
  return res.status(403).json({ 
    success: false, 
    error: "Direct credentials updates via API are disabled. Modify database records directly." 
  });
};

// @desc    Get user email by role
// @route   GET /api/auth/user/:role
// @access  Public
export const getUserByRole = async (req, res) => {
  const { role } = req.params;

  try {
    const user = await User.findOne({ role });
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({
      success: true,
      email: user.email
    });
  } catch (err) {
    console.error("Get User By Role Error:", err);
    res.status(500).json({ success: false, error: "Server Error" });
  }
};
