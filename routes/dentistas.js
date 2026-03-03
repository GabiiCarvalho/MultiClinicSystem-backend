const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.use(auth);

router.post('/', role('gestor'), (req, res) => {
  res.json({ message: 'Dentista cadastrado' });
});

router.post('/financeiro', role('gestor'), (req, res) => {
  res.json({ message: 'Usuário financeiro cadastrado' });
});

router.post('/atendente', role('gestor'), (req, res) => {
  res.json({ message: 'Atendente cadastrado' });
});

router.get('/', role('gestor'), (req, res) => {
  res.json({ message: 'Lista da equipe' });
});

module.exports = router;