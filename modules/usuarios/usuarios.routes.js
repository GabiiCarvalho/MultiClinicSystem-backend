const router = require("express").Router();
const auth = require("../../middleware/auth");
const { checkPermission } = require("../../middleware/rbac");
const audit = require("../../middleware/audit");
const ctrl = require("./usuarios.controller");

router.use(auth);

router.get("/", checkPermission(["usuarios:read"]), ctrl.listarUsuarios);
router.post(
  "/",
  checkPermission(["usuarios:create"]),
  audit("usuario.create", "usuario"),
  ctrl.criarUsuario,
);
router.patch(
  "/:id",
  checkPermission(["usuarios:update"]),
  audit("usuario.update", "usuario"),
  ctrl.atualizarUsuario,
);
router.delete(
  "/:id",
  checkPermission(["usuarios:delete"]),
  audit("usuario.delete", "usuario"),
  ctrl.desativarUsuario,
);

module.exports = router;
