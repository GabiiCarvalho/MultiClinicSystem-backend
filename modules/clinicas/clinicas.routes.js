const router = require("express").Router();
const auth = require("../../middleware/auth");
const { checkPermission } = require("../../middleware/rbac");
const audit = require("../../middleware/audit");
const ctrl = require("./clinicas.controller");

router.post("/register", ctrl.registrarClinica);

router.use(auth);
router.get("/me", ctrl.getClinica);
router.patch(
  "/me",
  checkPermission(["clinica:update"]),
  audit("clinica.update", "clinica"),
  ctrl.atualizarClinica,
);

module.exports = router;
