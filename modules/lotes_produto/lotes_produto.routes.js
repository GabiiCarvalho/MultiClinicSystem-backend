const router = require("express").Router();
const auth = require("../../middleware/auth");
const { checkPermission } = require("../../middleware/rbac");
const ctrl = require("./lotes_produto.controller");

router.use(auth);
router.get("/", checkPermission(["materiais:read"]), ctrl.listar);
router.post("/", checkPermission(["materiais:write"]), ctrl.criar);
module.exports = router;
