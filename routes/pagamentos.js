const express = require('express');
const router = express.Router();
const pagamentoController = require('../controllers/pagamentoController');
const authMiddleware = require('../middlewares/auth');

router.use(authMiddleware);

router.post('/', pagamentoController.criarPagamento);
router.get('/', pagamentoController.listarPagamentos);
router.get('/:pagamentoId', pagamentoController.obterPagamento);
router.get('/:pagamentoId/comprovante', pagamentoController.gerarComprovante);
router.post('/:pagamentoId/whatsapp', pagamentoController.enviarWhatsApp);

module.exports = router;