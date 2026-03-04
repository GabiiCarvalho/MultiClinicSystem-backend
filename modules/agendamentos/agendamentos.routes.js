const router = require('express').Router();
const auth = require('../../middleware/auth');
const { checkPermission } = require('../../middleware/rbac');
const ctrl = require('./agendamentos.controller');

// Todos precisam estar autenticados
router.use(auth);

router.get('/', checkPermission(['agendamentos:read', 'agendamentos:read:own']), ctrl.listarAgendamentos);
router.get('/:id', checkPermission(['agendamentos:read', 'agendamentos:read:own']), ctrl.getAgendamento);
router.post('/', checkPermission(['agendamentos:create']), ctrl.criarAgendamento);
router.patch('/:id/status',    checkPermission(['agendamentos:update', 'agendamentos:update:own']), ctrl.atualizarStatus);
router.patch('/:id/data',      checkPermission(['agendamentos:update', 'agendamentos:update:own']), ctrl.atualizarData);
router.patch('/:id/progresso', checkPermission(['agendamentos:update', 'agendamentos:update:own']), ctrl.atualizarProgresso);

module.exports = router;