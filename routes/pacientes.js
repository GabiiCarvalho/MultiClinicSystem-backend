const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

router.use(auth);

// gestor e atendente podem gerenciar pacientes
router.get('/', role('gestor', 'atendente'), (req, res) => {
  res.json({ message: 'Lista de pacientes' });
});

router.post('/', role('gestor', 'atendente'), (req, res) => {
  res.json({ message: 'Paciente criado' });
});

router.put('/:id', role('gestor', 'atendente'), (req, res) => {
  res.json({ message: 'Paciente atualizado' });
});

module.exports = router;