/**
 * RBAC - Role-Based Access Control
 * 
 * Permissões por cargo:
 * proprietário/gestor -> TUDO
 * atendente -> agendamentos, pacientes, agenda, orçamentos
 * financeiro -> caixa, agendamentos (ver), agenda (ver)
 * dentista -> SOMENTE seus próprios agendamentos
 * esteticistas -> SOMENTE seus próprios agendamentos
 */

const PERMISSIONS = {
    proprietario: ['*'],
    gestor: ['*'],
    atendente: [
        'agendamentos:read', 'agendamentos:create', 'agendamentos:update', 'agendamentos:cancel',
        'pacientes:read', 'pacientes:create', 'pacientes:update', 'pacientes:delete',
        'agenda:read', 'agenda:create', 'agenda:update', 'agenda:delete',
        'orcamentos:read', 'orcamentos:create',
    ],
    financeiro: [
        'agendamentos:read', 'agenda:read',
        'caixa:read', 'caixa:write',
        'pacientes:read',
        'relatorios:read',
    ],
    dentista: [
        'agendamentos:read:own', // SOMENTE os seus próprios agendamentos
        'agendamentos:update:own',
        'pacientes:read:own',
        'agenda:read:own',
    ],
    esteticista: [
        'agendamentos:read:own', // SOMENTE os seus próprios agendamentos
        'agendamentos:update:own',
        'pacientes:read:own',
        'agenda:read:own',
    ],
};

/**
 * Verifica se o cargo tem permissão para a ação
 * @param {string[]} requiredPermissions 
 */

const checkPermission = (requiredPermissions) => {
    return (req, res, next) => {
        const { cargo } = req.user;
        const userPerms = PERMISSIONS[cargo] || [];

        // Gestor/Proprietário passam direto
        if (userPerms.includes('*')) return next();

        const hasAll = requiredPermissions.every(p => userPerms.includes(p));
        if (!hasAll) {
            return res.status(403).json({ error: 'Acesso negado', detail: `Cargo "${cargo}" não tem permissão para esta operação.` });
        }
        next();
    };
};

/**
 *  Verifica se dentista/esteticista só vê seus próprios dados
 *  Injeta req.filterByProfissional = true quando necessário
 */

const isolateProfissional = (req, res, next) => {
    const { cargo, id } = req.user;
    if ([ 'dentista', 'esteticista' ].includes(cargo)) {
        req.filterByProfissional = true;
        req.profissionalId = id;
    }
    next();
};

module.exports = { checkPermission, isolateProfissional, PERMISSIONS };