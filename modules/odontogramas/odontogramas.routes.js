const router = require("express").Router();
const auth = require("../../middleware/auth");
const { checkPermission } = require("../../middleware/rbac");
const audit = require("../../middleware/audit");
const ctrl = require("./odontogramas.controller");

router.use(auth);

router.get(
  "/paciente/:paciente_id",
  checkPermission(["pacientes:read"]),
  ctrl.listarOdontogramas,
);

router.get(
  "/paciente/:paciente_id/atual",
  checkPermission(["pacientes:read"]),
  ctrl.getOdontogramaAtual,
);

router.post(
  "/",
  checkPermission(["agendamentos:update", "agendamentos:update:own"]),
  audit("odontograma.create", "odontograma"),
  ctrl.criarOdontograma,
);

module.exports = router;
