const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { checkPermission } = require("../middleware/rbac");

router.use(auth);

router.get("/estatisticas", checkPermission(["materiais:read"]), (req, res) => {
  res.json({
    total_materiais: 0,
    valor_total_estoque: 0,
    materiais_estoque_baixo: 0,
    materiais_esgotados: 0,
  });
});

router.get("/", checkPermission(["materiais:read"]), (req, res) => {
  res.json({ materiais: [] });
});

router.post("/", checkPermission(["materiais:write"]), (req, res) => {
  res.status(201).json({ message: "Material criado com sucesso" });
});

router.put("/:id", checkPermission(["materiais:write"]), (req, res) => {
  res.json({ message: "Material atualizado com sucesso" });
});

router.delete("/:id", checkPermission(["materiais:write"]), (req, res) => {
  res.json({ message: "Material removido com sucesso" });
});

router.post(
  "/:id/movimentacoes",
  checkPermission(["materiais:write"]),
  (req, res) => {
    res.status(201).json({ message: "Movimentação registrada com sucesso" });
  },
);

module.exports = router;
