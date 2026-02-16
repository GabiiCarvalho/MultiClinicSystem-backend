const express = require('express');
const router = express.Router();
const vendaController = require('../controllers/vendas');
const authMiddleware = require('../middlewares/auth');
const lojaMiddleware = require('../middlewares/loja');

// Listar vendas da loja
router.get('/', authMiddleware, lojaMiddleware, vendaController.listar);

// Criar nova venda
router.post('/', authMiddleware, lojaMiddleware, vendaController.criar);

// Obter detalhes de uma venda
router.get('/:vendaId', authMiddleware, lojaMiddleware, vendaController.obterPorId);

// Cancelar venda
router.delete('/:vendaId', authMiddleware, lojaMiddleware, vendaController.cancelar);

// Relatório de vendas por período
router.get('/relatorio/periodo', authMiddleware, lojaMiddleware, vendaController.relatorioPeriodo);

// Relatório de procedimentos mais realizados
router.get('/relatorio/procedimentos', authMiddleware, lojaMiddleware, vendaController.relatorioProcedimentos);

// Relatório por dentista
router.get('/relatorio/dentista/:dentistaId', authMiddleware, lojaMiddleware, vendaController.relatorioPorDentista);

// Relatório por forma de pagamento
router.get('/relatorio/pagamentos', authMiddleware, lojaMiddleware, vendaController.relatorioPagamentos);

module.exports = router;