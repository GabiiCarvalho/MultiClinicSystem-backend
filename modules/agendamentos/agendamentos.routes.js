const router = require("express").Router();
const auth = require("../../middleware/auth");
const { checkPermission } = require("../../middleware/rbac");
const audit = require("../../middleware/audit");
const ctrl = require("./agendamentos.controller");

router.use(auth);

router.get(
  "/",
  checkPermission(["agendamentos:read", "agendamentos:read:own"]),
  ctrl.listarAgendamentos,
);
router.get(
  "/:id",
  checkPermission(["agendamentos:read", "agendamentos:read:own"]),
  ctrl.getAgendamento,
);
router.post(
  "/",
  checkPermission(["agendamentos:create"]),
  audit("agendamento.create", "agendamento"),
  ctrl.criarAgendamento,
);
router.patch(
  "/:id/status",
  checkPermission(["agendamentos:update", "agendamentos:update:own"]),
  audit("agendamento.status", "agendamento"),
  ctrl.atualizarStatus,
);
router.patch(
  "/:id/data",
  checkPermission(["agendamentos:update", "agendamentos:update:own"]),
  audit("agendamento.reagendar", "agendamento"),
  ctrl.atualizarData,
);
router.patch(
  "/:id/progresso",
  checkPermission(["agendamentos:update", "agendamentos:update:own"]),
  ctrl.atualizarProgresso,
);
router.patch(
  "/:id/pago",
  checkPermission(["caixa:write"]),
  audit("agendamento.pago", "agendamento"),
  ctrl.marcarPago,
);

module.exports = router;
