const router = require('express').Router();
const auth   = require('../../middleware/auth');
const ctrl   = require('./clinicas.controller');

// Pública: registro de nova clínica
router.post('/register', ctrl.registrarClinica);

// Protegidas
router.get('/me',    auth, ctrl.getClinica);
router.patch('/me',  auth, ctrl.atualizarClinica);

module.exports = router;