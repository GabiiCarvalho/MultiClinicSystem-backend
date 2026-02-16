const express = require('express');
const router = express.Router();
const procedimentoController = require('../controllers/procedimentos');
const authMiddleware = require('../middlewares/auth');
const lojaMiddleware = require('../middlewares/loja');

router.get('/', authMiddleware, lojaMiddleware, procedimentoController.listar);
router.post('/', authMiddleware, lojaMiddleware, procedimentoController.criar);
router.get('/:procedimentoId', authMiddleware, lojaMiddleware, procedimentoController.obterPorId);
router.put('/:procedimentoId', authMiddleware, lojaMiddleware, procedimentoController.atualizar);
router.patch('/:procedimentoId/status', authMiddleware, lojaMiddleware, procedimentoController.atualizarStatus);

module.exports = router;