import jwt from "jsonwebtoken";

// Verify JWT and authenticate user session
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "Access denied. Authentication token is missing or malformed." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const jwtSecret = process.env.JWT_SECRET || "fallback_default_jwt_secret_key_123456";
    const verified = jwt.verify(token, jwtSecret);
    req.user = verified;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(403).json({ success: false, error: "Access denied. Authentication token is invalid or expired." });
  }
};

// Check if user role matches allowed roles
export const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: "Access denied. Session unauthenticated." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, error: "Access denied. You do not have permission to execute this operation." });
    }

    next();
  };
};
