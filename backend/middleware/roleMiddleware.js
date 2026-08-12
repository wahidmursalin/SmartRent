// Usage: authorize("landlord") or authorize("tenant", "landlord")
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, no user" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. This action requires role: ${roles.join(" or ")}`,
      });
    }

    next();
  };
};

module.exports = { authorize };
