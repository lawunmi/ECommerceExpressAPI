import jwt from "jsonwebtoken";

export const authentication = async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ status: "fail", message: "No token provided" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (error, payload) => {
    if (error) {
      return res.status(403).json({ status: "fail", message: "Invalid token" });
    }
    req.user = { id: payload.id, admin: payload.admin };
    next();
  });
};
