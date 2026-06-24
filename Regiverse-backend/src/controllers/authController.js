import User from "../models/user.js";
import bcryptjs from "bcryptjs";

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

    res.json({
      success: true,
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
  const { role, newEmail, newPassword } = req.body;

  try {
    if (!role || !newEmail) {
      return res.status(400).json({ success: false, error: "Target role and new email are required." });
    }

    // Find the user to update by role
    const user = await User.findOne({ role });
    if (!user) {
      return res.status(404).json({ success: false, error: `Account with role ${role} not found.` });
    }

    // If new email is different from current, check if it's already taken by another account
    if (newEmail.toLowerCase() !== user.email.toLowerCase()) {
      const emailExists = await User.findOne({ email: newEmail.toLowerCase() });
      if (emailExists) {
        return res.status(409).json({ success: false, error: "This email address is already in use by another user." });
      }
      user.email = newEmail.toLowerCase();
    }

    // Update password if provided
    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ success: false, error: "Password must be at least 6 characters long." });
      }
      user.password = await bcryptjs.hash(newPassword, 10);
    }

    await user.save();

    res.json({
      success: true,
      message: `Credentials for ${role} updated successfully.`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error("Update Credentials Error:", err);
    res.status(500).json({ success: false, error: "Server Error" });
  }
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
