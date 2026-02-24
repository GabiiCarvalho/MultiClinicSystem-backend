const jwt = require('jsonwebtoken');
const { Pessoa, Loja } = require('../models');

module.exports = async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET não configurado');
    }

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

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await Pessoa.findOne({
      where: {
        id: decoded.id,
        ativo: true
      },
      include: [{
        model: Loja,
        as: 'loja',
        where: { ativa: true }
      }]
    });

    if (!user) {
      return res.status(401).json({ error: 'Usuário inválido ou inativo' });
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

    return res.status(401).json({ error: 'Falha na autenticação' });
  }
};