const router = require("express").Router();
const auth = require("../../middleware/auth");
const { checkPermission } = require("../../middleware/rbac");
const audit = require("../../middleware/audit");
const ctrl = require("./pacientes.controller");

router.use(auth);

router.get("/", checkPermission(["pacientes:read"]), ctrl.listarPacientes);
router.get("/:id", checkPermission(["pacientes:read"]), ctrl.getPaciente);
router.post(
  "/",
  checkPermission(["pacientes:create"]),
  audit("paciente.create", "paciente"),
  ctrl.criarPaciente,
);
router.patch(
  "/:id",
  checkPermission(["pacientes:update"]),
  audit("paciente.update", "paciente"),
  ctrl.atualizarPaciente,
);

module.exports = router;
