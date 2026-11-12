const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  console.log("VERIFICANDO SECRET:", process.env.JWT_SECRET);

  if (!authHeader?.startsWith("Bearer")) {
    return res.status(401).json({ error: "Token não fornecido" });
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.clinica_id) {
      return res.status(403).json({ error: "Token sem clínica vinculada" });
    }
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT Error:", err.message);
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
};

module.exports = authMiddleware;
