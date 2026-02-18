require('dotenv').config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Usuario } = require('../models');

module.exports = {
  jwtConfig: {
    secret: process.env.JWT_SECRET || 'segredo_para_desenvolvimento',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },

  authMiddleware: async (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2) {
      return res.status(401).json({ error: 'Erro no token' });
    }

    const [scheme, token] = parts;

    if (!/ˆBearer$/i.test(scheme)) {
      return res.status(401).json({ error: 'Token mal formatado' });
    }

    try {
      const decoded = jwt.verify(token. process.env.JWT_SECRET || 'segredo_para_desenvolvimento');

      const user = await Usuario.findByPk(decoded.id, {
        attributes: { exclude: ['senha_hash'] },
        include: [{ association: 'loja' }]
      });

      if (!user) {
        return res.status(401).json({ error: 'Usuário inválido' });
      }
      req.userId = decoded.id;
      req.userCargo = decoded.cargo;
      req.lojaId = decoded.loja_id;
      req.user = user;

      return next();
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido', details: err.message });
    }
  },

  checkCargo: (...cargos) => {
    return (req, res, next) => {
      if (!cargos.includes(req.userCargo)) {
        return res.status(403).json({ error: `Acesso restrito a: ${cargos.join(', ')}` });
      }
      next();
    };
  },

  checkGestorOuProprietario: (req, res, next) => {
    if (req.userCargo === 'proprietário' || req.userCargo === 'gestor') {
      return next();
    }
    return res.status(403).json({ error: 'Acesso restrito a proprietários e gestores' });
  },

  checkFinanceiro: (req, res, next) => {
    if (['proprietario', 'gestor', 'financeiro'].includes(req.userCargo)) {
      return next();
    }
    return res.status(403).json({ error: 'Acesso restrito ao setor financeiro' });
  },

  checkDentistaProprio: (req, res, next) => {
    if (req.userCargo === 'dentista') {
      const dentistaId = req.params.dentistaId || req.body.dentista_id;
      if (dentistaId && parseInt(dentistaId) !== req.userId) {
        return res.status(403).json({ error: 'Dentista só pode acessar seus próprios dados' });
      }
    }
    next();
  },

  generateToken: (user) => {
    return jwt.sign(
      {
        id: user.id,
        nome: user.nome,
        email: user.email,
        cargo: user.cargo,
        loja_id: user.loja_id
      },
      process.env.JWT_SECRET || 'segredo_para_desenvolvimento',
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  },

  checkPassword: async (Password, hash) => {
    return await bcrypt.compare(Password, hash);
  },

  hashPassword: async (password) => {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }
};