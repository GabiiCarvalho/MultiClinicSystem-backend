const router = require("express").Router();
const auth = require("../../middleware/auth");
const { checkPermission } = require("../../middleware/rbac");
const audit = require("../../middleware/audit");
const ctrl = require("./consentimentos_imagem.controller");

router.use(auth);
router.get("/texto", ctrl.obterTexto);
router.get(
  "/paciente/:paciente_id",
  checkPermission(["pacientes:read"]),
  ctrl.buscarAtual,
);
router.post(
  "/",
  checkPermission(["pacientes:update"]),
  audit("consentimento.create", "consentimento"),
  ctrl.assinar,
);
module.exports = router;
