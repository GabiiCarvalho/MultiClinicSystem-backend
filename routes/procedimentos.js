const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

router.use(auth);

// somente gestor pode cadastrar/editar
router.post('/', role('gestor'), (req, res) => {
  res.json({ message: 'Procedimento criado' });
});

router.put('/:id', role('gestor'), (req, res) => {
  res.json({ message: 'Procedimento atualizado' });
});

// todos podem visualizar
router.get('/', role('gestor','atendente','dentista','financeiro'), (req, res) => {
  res.json({ message: 'Lista de procedimentos' });
});

module.exports = router;