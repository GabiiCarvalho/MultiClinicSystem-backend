const router = require("express").Router();
const auth = require("../../middleware/auth");
const { checkPermission } = require("../../middleware/rbac");
const ctrl = require("./materiais.controller");

router.use(auth);

router.get(
  "/estatisticas",
  checkPermission(["materiais:read"]),
  ctrl.getEstatisticas,
);
router.get("/", checkPermission(["materiais:read"]), ctrl.listarMateriais);
router.post("/", checkPermission(["materiais:write"]), ctrl.criarMaterial);
router.put(
  "/:id",
  checkPermission(["materiais:write"]),
  ctrl.atualizarMaterial,
);
router.delete(
  "/:id",
  checkPermission(["materiais:write"]),
  ctrl.deletarMaterial,
);
router.post(
  "/:id/movimentacoes",
  checkPermission(["materiais:write"]),
  ctrl.movimentarEstoque,
);

module.exports = router;
