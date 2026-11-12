const router = require("express").Router();
const auth = require("../../middleware/auth");
const { checkPermission } = require("../../middleware/rbac");
const audit = require("../../middleware/audit");
const ctrl = require("./pacotes.controller");

router.use(auth);

router.get("/", checkPermission(["pacientes:read"]), ctrl.listarPacotes);
router.post(
  "/",
  checkPermission(["caixa:write"]),
  audit("pacote.create", "pacote"),
  ctrl.criarPacote,
);
router.post(
  "/:id/debitar-sessao",
  checkPermission(["agendamentos:update", "agendamentos:update:own"]),
  audit("pacote.debitar", "pacote"),
  ctrl.debitarSessao,
);

module.exports = router;
