const express = require('express');
const router = express.Router();
const pacienteController = require('../controllers/clientes');
const authMiddleware = require('../middlewares/auth');
const lojaMiddleware = require('../middlewares/loja');

router.get('/', authMiddleware, lojaMiddleware, pacienteController.listar);
router.post('/', authMiddleware, lojaMiddleware, pacienteController.criar);
router.get('/buscar/:termo', authMiddleware, lojaMiddleware, pacienteController.buscar);
router.get('/:pacienteId', authMiddleware, lojaMiddleware, pacienteController.obterPorId);
router.put('/:pacienteId', authMiddleware, lojaMiddleware, pacienteController.atualizar);
router.get('/:pacienteId/agendamentos', authMiddleware, lojaMiddleware, pacienteController.listarAgendamentos);

module.exports = router;