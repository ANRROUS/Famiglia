import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  // Intentar obtener el token de las cookies o del header Authorization
  const token = req.cookies?.authToken || req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(403).json({ message: "Token no proporcionado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "famiglia-secret");
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Token inválido o expirado" });
  }
};
