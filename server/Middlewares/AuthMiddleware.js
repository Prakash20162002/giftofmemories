import jwt from "jsonwebtoken";
export const AdminMiddleware = (req, res, next) => {
  const token = req.cookies.adminToken;
  if (!token) return res.status(401).send("Unauthorized");
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).send("Invalid Token");
    req.adminId = decoded.id;
    next();
  });
};

// Export verifyToken as an alias for AdminMiddleware for consistency
export const verifyToken = AdminMiddleware;
