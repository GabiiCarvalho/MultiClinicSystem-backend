const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userCargo = decoded.cargo;
    req.lojaId = decoded.loja_id;

    // Verifica se o usuário ainda existe no banco
    const user = await Usuario.findByPk(decoded.id);
    if (!user || !user.ativo) {
      return res.status(401).json({ error: 'Usuário inválido' });
    }

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
};

// Middleware para verificar permissões específicas
module.exports.hasPermission = (allowedCargos) => {
  return (req, res, next) => {
    if (!allowedCargos.includes(req.userCargo)) {
      return res.status(403).json({ 
        error: 'Acesso não autorizado para este cargo',
        required: allowedCargos,
        current: req.userCargo
      });
    }
    next();
  };
};

// Middleware específico para financeiro (apenas eles podem acessar caixa)
module.exports.isFinanceiro = (req, res, next) => {
  if (!['proprietario', 'gestor', 'financeiro'].includes(req.userCargo)) {
    return res.status(403).json({ 
      error: 'Acesso restrito ao financeiro, gestores e proprietários' 
    });
  }
  next();
};

// Middleware para dentistas (acesso apenas aos próprios agendamentos)
module.exports.isDentista = (req, res, next) => {
  if (req.userCargo === 'dentista') {
    // Para dentistas, podemos adicionar validação se o ID da rota corresponde ao dentista
    const dentistaId = req.params.dentistaId || req.body.dentista_id;
    if (dentistaId && parseInt(dentistaId) !== req.userId) {
      return res.status(403).json({ error: 'Dentista só pode acessar seus próprios dados' });
    }
  }
  next();
};

module.exports.isProprietario = (req, res, next) => {
  if (req.userCargo !== 'proprietario') {
    return res.status(403).json({ error: 'Acesso restrito a proprietários' });
  }
  next();
};