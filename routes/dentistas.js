const express = require('express');
const router = express.Router();
const dentistaController = require('../controllers/dentistas');
const authMiddleware = require('../middlewares/auth');
const lojaMiddleware = require('../middlewares/loja');

router.get('/', authMiddleware, lojaMiddleware, dentistaController.listar);
router.post('/', authMiddleware, lojaMiddleware, dentistaController.criar);
router.get('/:dentistaId', authMiddleware, lojaMiddleware, dentistaController.obterPorId);
router.put('/:dentistaId', authMiddleware, lojaMiddleware, dentistaController.atualizar);
router.get('/:dentistaId/agendamentos', authMiddleware, lojaMiddleware, dentistaController.listarAgendamentos);

module.exports = router;