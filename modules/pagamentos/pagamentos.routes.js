const router = require("express").Router();
const auth = require("../../middleware/auth");
const { checkPermission } = require("../../middleware/rbac");
const audit = require("../../middleware/audit");
const ctrl = require("./pagamentos.controller");

router.use(auth);

router.get("/", checkPermission(["caixa:read"]), ctrl.listarPagamentos);
router.post(
  "/",
  checkPermission(["caixa:write"]),
  audit("pagamento.create", "pagamento"),
  ctrl.criarPagamento,
);

module.exports = router;
