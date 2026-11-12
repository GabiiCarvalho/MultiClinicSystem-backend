const router = require("express").Router();
const auth = require("../../middleware/auth");
const { checkPermission } = require("../../middleware/rbac");
const audit = require("../../middleware/audit");
const ctrl = require("./aplicacoes.controller");

router.use(auth);
router.get(
  "/paciente/:paciente_id",
  checkPermission(["pacientes:read"]),
  ctrl.listarPorPaciente,
);
router.get(
  "/lote/:lote_id",
  checkPermission(["materiais:read", "pacientes:read"]),
  ctrl.rastrearLote,
);
router.post(
  "/",
  checkPermission(["agendamentos:update", "agendamentos:update:own"]),
  audit("aplicacao.create", "aplicacao"),
  ctrl.criar,
);
module.exports = router;
