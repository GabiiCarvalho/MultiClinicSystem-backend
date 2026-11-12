const router = require("express").Router();
const auth = require("../../middleware/auth");
const { checkPermission } = require("../../middleware/rbac");
const audit = require("../../middleware/audit");
const ctrl = require("./evolucoes.controller");

router.use(auth);

router.get(
  "/paciente/:paciente_id",
  checkPermission(["pacientes:read"]),
  ctrl.listarEvolucoes,
);

router.post(
  "/",
  checkPermission(["agendamentos:update", "agendamentos:update:own"]),
  audit("evolucao.create", "evolucao"),
  ctrl.criarEvolucao,
);

module.exports = router;
