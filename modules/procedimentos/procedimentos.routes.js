const router = require("express").Router();
const auth = require("../../middleware/auth");
const { checkPermission } = require("../../middleware/rbac");
const audit = require("../../middleware/audit");
const ctrl = require("./procedimentos.controller");

router.use(auth);

router.get("/", checkPermission(["procedimentos:read"]), ctrl.listar);
router.post(
  "/",
  checkPermission(["procedimentos:write"]),
  audit("procedimento.create", "procedimento"),
  ctrl.criar,
);
router.patch(
  "/:id",
  checkPermission(["procedimentos:write"]),
  audit("procedimento.update", "procedimento"),
  ctrl.atualizar,
);
router.delete(
  "/:id",
  checkPermission(["procedimentos:write"]),
  audit("procedimento.delete", "procedimento"),
  ctrl.desativar,
);

module.exports = router;
