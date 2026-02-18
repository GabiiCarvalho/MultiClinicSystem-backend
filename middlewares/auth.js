const jwt = require('jsonwebtoken');
const { Usuario, Loja } = require('../models');

// Middleware principal de autenticação
const authMiddleware = async (req, res, next) => {
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'segredo_temporario_para_desenvolvimento');
    
    // Busca usuário completo com a loja
    const user = await Usuario.findByPk(decoded.id, {
      include: [{ model: Loja, as: 'loja' }]
    });
    
    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    if (!user.ativo) {
      return res.status(401).json({ error: 'Usuário inativo' });
    }

    if (!user.loja || !user.loja.ativa) {
      return res.status(401).json({ error: 'Loja não encontrada ou inativa' });
    }

    // Adiciona informações do usuário e loja ao request
    req.userId = user.id;
    req.userCargo = user.cargo;
    req.lojaId = user.loja_id;
    req.lojaCNPJ = user.loja.cnpj;
    req.user = user;
    req.loja = user.loja;

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

// Middleware para verificar permissões por cargo
const hasPermission = (allowedCargos) => {
  return (req, res, next) => {
    if (!req.userCargo) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    // Converte para array se for string
    const cargosPermitidos = Array.isArray(allowedCargos) ? allowedCargos : [allowedCargos];
    
    if (!cargosPermitidos.includes(req.userCargo)) {
      return res.status(403).json({ 
        error: 'Acesso não autorizado para este cargo',
        required: cargosPermitidos,
        current: req.userCargo
      });
    }
    next();
  };
};

// Middleware específico para financeiro (caixa e relatórios)
const isFinanceiro = (req, res, next) => {
  if (!['gestor', 'financeiro'].includes(req.userCargo)) {
    return res.status(403).json({ 
      error: 'Acesso restrito ao financeiro e gestores',
      current: req.userCargo
    });
  }
  next();
};

// Middleware para dentistas (acesso apenas aos próprios dados)
const isDentistaProprio = (req, res, next) => {
  if (req.userCargo === 'dentista') {
    // Verifica se o ID da rota corresponde ao dentista
    const dentistaId = req.params.dentistaId || req.params.id || req.body.dentista_id;
    
    if (dentistaId && parseInt(dentistaId) !== req.userId) {
      return res.status(403).json({ 
        error: 'Dentista só pode acessar seus próprios dados',
        requestedId: dentistaId,
        yourId: req.userId
      });
    }
  }
  next();
};

// Middleware para gestor (acesso total)
const isGestor = (req, res, next) => {
  if (req.userCargo !== 'gestor') {
    return res.status(403).json({ 
      error: 'Acesso restrito a gestores',
      current: req.userCargo
    });
  }
  next();
};

// Middleware para atendente (acesso à recepção)
const isAtendente = (req, res, next) => {
  if (!['gestor', 'atendente'].includes(req.userCargo)) {
    return res.status(403).json({ 
      error: 'Acesso restrito a atendentes e gestores',
      current: req.userCargo
    });
  }
  next();
};

// Middleware para verificar se pode criar/editar pacientes
const canManagePatients = (req, res, next) => {
  // Gestor e atendente podem gerenciar pacientes
  if (['gestor', 'atendente'].includes(req.userCargo)) {
    return next();
  }
  
  // Financeiro pode ver, mas não criar/editar
  if (req.method === 'GET' && req.userCargo === 'financeiro') {
    return next();
  }

  return res.status(403).json({ 
    error: 'Acesso negado',
    message: 'Você não tem permissão para gerenciar pacientes',
    current: req.userCargo
  });
};

// Middleware para verificar se pode criar/editar agendamentos
const canManageAppointments = (req, res, next) => {
  // Gestor e atendente podem gerenciar agendamentos
  if (['gestor', 'atendente'].includes(req.userCargo)) {
    return next();
  }
  
  // Dentista pode ver seus próprios agendamentos
  if (req.method === 'GET' && req.userCargo === 'dentista') {
    return next();
  }

  return res.status(403).json({ 
    error: 'Acesso negado',
    message: 'Você não tem permissão para gerenciar agendamentos',
    current: req.userCargo
  });
};

// Middleware para filtrar dados por cargo (para queries)
const filterByRole = (req, res, next) => {
  // Adiciona filtros baseados no cargo
  if (req.userCargo === 'dentista') {
    // Dentista só vê seus próprios dados
    req.dentistaFilter = { dentista_id: req.userId };
  }
  
  // Sempre filtra por loja
  req.lojaFilter = { loja_id: req.lojaId };
  
  next();
};

// Exporta todos os middlewares
module.exports = {
  authMiddleware,
  hasPermission,
  isFinanceiro,
  isDentistaProprio,
  isGestor,
  isAtendente,
  canManagePatients,
  canManageAppointments,
  filterByRole
};