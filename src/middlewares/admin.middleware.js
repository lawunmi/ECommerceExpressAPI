export const adminMiddleware = (req, res, next) => {
  // Check if user is authenticated
  if (!req.user || !req.user.admin) {
    return res.status(403).json({
      status: "fail",
      message: "Access denied. Admins only.",
    });
  }

  next();
};
