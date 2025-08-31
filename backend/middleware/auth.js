// middleware/auth.js
import jwt from "jsonwebtoken";

const authMiddleware = async (req, res, next) => {
  const { token } = req.headers;

  if (!token) {
    return res.status(401).json({ success: false, message: "Not authorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach userId to request (for controllers to use)
    req.userId = decoded.id || decoded._id;

    if (!req.userId) {
      return res.status(401).json({ success: false, message: "Invalid token payload" });
    }

    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export default authMiddleware;
