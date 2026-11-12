const router = require("express").Router();
const auth = require("../../middleware/auth");
const ctrl = require("./assinaturas.controller");

// 1. Rota Pública (Webhook)
router.post("/webhook", ctrl.receberWebhook);

// 2. Rotas protegidas (Usuário logado)
router.use(auth);

// ✅ Rota leve para o polling do frontend
router.get("/status", ctrl.verificarStatusAssinatura);

// Rota frontend pop-up de checkout
router.post("/checkout", ctrl.criarCheckoutAssinatura);

module.exports = router;
