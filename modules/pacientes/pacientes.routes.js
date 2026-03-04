const router = require('express').Router();
const auth = require('../../middleware/rbac');
const ctrl = require('./pacientes.controller');

router.use(auth);

router.get('/', checkPermission(['pacientes:read']), ctrl.listarPacientes);
router.get('/:id', checkPermission(['pacientes:read']), ctrl.getPaciente);
router.post('/', checkPermission(['pacientes:create']), ctrl.criarPaciente);
router.patch('/:id', checkPermission(['pacientes:update']), ctrl.atualizarPaciente);

// Rota especial: CalendarSaaS atualiza data_hora via Drag&Drop
router.patch('/:id/data', checkPermission(['pacientes:update']), ctrl.atualizarPaciente);