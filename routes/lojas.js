const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const lojaMiddleware = require('../middlewares/loja');
const lojaController = require('../controllers/lojas');

// Listar todas as lojas (apenas proprietário/gestor)
router.get('/', authMiddleware, lojaController.listar);

// Estatísticas da loja
router.get('/estatisticas', authMiddleware, lojaMiddleware, lojaController.estatisticas);

// Obter detalhes de uma loja
router.get('/:lojaId', authMiddleware, lojaMiddleware, lojaController.obterPorId);

// Atualizar loja (apenas proprietário)
router.put('/:lojaId', authMiddleware, lojaMiddleware, lojaController.atualizar);

module.exports = router;