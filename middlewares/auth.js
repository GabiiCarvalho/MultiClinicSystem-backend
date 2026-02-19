const jwt = require('jsonwebtoken');
const { Pessoa, Loja } = require('../models');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const parts = authHeader.split(' ');
  
  if (parts.length !== 2) {
    return res.status(401).json({ error: 'Token mal formatado' });
  }

  const [scheme, token] = parts;

  if (!/^Bearer$/i.test(scheme)) {
    return res.status(401).json({ error: 'Token mal formatado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'segredo_temporario');
    
    const user = await Pessoa.findByPk(decoded.id, {
      include: [{ model: Loja, as: 'loja' }]
    });
    
    if (!user || !user.ativo) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    if (!user.loja || !user.loja.ativa) {
      return res.status(401).json({ error: 'Loja não encontrada' });
    }

    req.userId = user.id;
    req.userTipo = user.tipo;
    req.userCargo = user.cargo;
    req.lojaId = user.loja_id;
    req.loja = user.loja;
    req.user = user;

    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    return res.status(500).json({ error: 'Erro na autenticação' });
  }
};