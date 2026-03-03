const jwt = require('jsonwebtoken');

/**
 * Verifica o token JWT e injeta req.user com:
 * { id, clinica_id, cargo, nome, email }
 * Garante isolamento: todo dano é filtrado por clinica_id
 */

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, clinica_id, cargo, nome, email }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido ou expirado' });
  }
};

module.exports = authMiddleware;