const express = require('express');
const router = express.Router();
const financeiroController = require('../controllers/financeiro');
const { 
  authMiddleware, 
  isFinanceiro,
  filterByRole 
} = require('../middlewares/auth');

router.use(authMiddleware);
router.use(filterByRole);

// Rotas de caixa (apenas financeiro e gestor)
router.get('/caixa', isFinanceiro, financeiroController.getCaixa);
router.post('/vendas', isFinanceiro, financeiroController.registrarVenda);
router.get('/relatorios', isFinanceiro, financeiroController.relatorios);

module.exports = router;