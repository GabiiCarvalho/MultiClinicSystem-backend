const router = require("express").Router();
const auth = require("../../middleware/auth");
const ctrl = require("./mercadopago.controller");

router.use(auth); // Todas as rotas abaixo exigem login

router.post("/processar-pagamento", ctrl.processarPagamento);
router.get("/status-assinatura", ctrl.verificarStatusAssinatura);

module.exports = router;
