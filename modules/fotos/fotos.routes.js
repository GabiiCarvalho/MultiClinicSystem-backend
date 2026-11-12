const router = require("express").Router();
const auth = require("../../middleware/auth");
const { checkPermission } = require("../../middleware/rbac");
const audit = require("../../middleware/audit");
const ctrl = require("./fotos.controller");

router.use(auth);

router.get(
  "/paciente/:paciente_id",
  checkPermission(["pacientes:read"]),
  ctrl.listarFotos,
);

router.post(
  "/",
  checkPermission([
    "pacientes:update",
    "agendamentos:update",
    "agendamentos:update:own",
  ]),
  audit("foto.create", "foto"),
  ctrl.criarFoto,
);

router.delete(
  "/:id",
  checkPermission(["pacientes:update"]),
  audit("foto.delete", "foto"),
  ctrl.deletarFoto,
);

module.exports = router;
