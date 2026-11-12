const router = require("express").Router();
const auth = require("../../middleware/auth");
const { checkPermission } = require("../../middleware/rbac");
const ctrl = require("./receita_diferida.controller");

router.use(auth);
router.get("/resumo", checkPermission(["caixa:read"]), ctrl.resumo);
router.get(
  "/paciente/:paciente_id",
  checkPermission(["caixa:read", "pacientes:read"]),
  ctrl.porPaciente,
);
module.exports = router;
