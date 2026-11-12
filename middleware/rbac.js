const PERMISSIONS = {
  proprietario: ["*"],
  gestor: ["*"],

  atendente: [
    "usuarios:read",
    "agendamentos:read",
    "agendamentos:create",
    "agendamentos:update",
    "agendamentos:cancel",
    "pacientes:read",
    "pacientes:create",
    "pacientes:update",
    "procedimentos:read",
    "materiais:read",
    "dashboard:read",
  ],
  financeiro: [
    "usuarios:read",
    "agendamentos:read",
    "pacientes:read",
    "procedimentos:read",
    "caixa:read",
    "caixa:write",
    "dashboard:read",
    "materiais:read",
  ],
  dentista: [
    "usuarios:read",
    "agendamentos:read:own",
    "agendamentos:update:own",
    "pacientes:read",
    "procedimentos:read",
  ],
  esteticista: [
    "usuarios:read",
    "agendamentos:read:own",
    "agendamentos:update:own",
    "pacientes:read",
    "procedimentos:read",
  ],
};

const checkPermission = (requiredPermissions) => {
  return (req, res, next) => {
    const { cargo } = req.user;
    const userPerms = PERMISSIONS[cargo] || [];

    if (userPerms.includes("*")) {
      return next();
    }

    const hasAny = requiredPermissions.some((p) => userPerms.includes(p));
    if (!hasAny) {
      return res.status(403).json({
        error: "Acesso negado",
        detail: `Cargo "${cargo}" não tem permissão para esta operação`,
      });
    }
    next();
  };
};

module.exports = { checkPermission, PERMISSIONS };
