/**
 * RBAC — Role-Based Access Control
 *
 * proprietario/gestor → tudo
 * atendente           → agendamentos + pacientes + agenda (sem caixa)
 * financeiro          → caixa + leitura de agendamentos/pacientes
 * dentista            → SOMENTE os seus agendamentos e pacientes
 * esteticista         → SOMENTE os seus agendamentos e pacientes
 */

const PERMISSIONS = {
  proprietario: ['*'],
  gestor:       ['*'],
  atendente: [
    'agendamentos:read', 'agendamentos:create',
    'agendamentos:update', 'agendamentos:cancel',
    'pacientes:read', 'pacientes:create', 'pacientes:update',
    'agenda:read', 'agenda:update',
    'usuarios:read',
  ],
  financeiro: [
    'agendamentos:read',
    'pacientes:read',
    'agenda:read',
    'caixa:read', 'caixa:write',
    'usuarios:read',
  ],
  dentista: [
    'agendamentos:read:own',
    'agendamentos:update:own',
    'pacientes:read:own',
    'agenda:read:own',
  ],
  esteticista: [
    'agendamentos:read:own',
    'agendamentos:update:own',
    'pacientes:read:own',
    'agenda:read:own',
  ],
};

/**
 * Verifica se o cargo tem pelo menos UMA das permissões listadas.
 * Aceita tanto permissão exata quanto versão :own
 * Ex: checkPermission(['agendamentos:read', 'agendamentos:read:own'])
 */
const checkPermission = (requiredPermissions) => {
  return (req, res, next) => {
    const { cargo } = req.user;
    const userPerms = PERMISSIONS[cargo] || [];

    // Gestor/proprietário passam direto
    if (userPerms.includes('*')) return next();

    // Verifica se tem ao menos uma das permissões requeridas
    const hasAny = requiredPermissions.some(p => userPerms.includes(p));

    if (!hasAny) {
      return res.status(403).json({
        error: 'Acesso negado',
        detail: `Cargo "${cargo}" não tem permissão para esta operação`,
      });
    }
    next();
  };
};

module.exports = { checkPermission, PERMISSIONS };