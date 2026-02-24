const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

router.use(auth);

// gestor controla estoque
router.post('/', role('gestor'), (req, res) => {
  res.json({ message: 'Material criado' });
});

router.put('/:id', role('gestor'), (req, res) => {
  res.json({ message: 'Material atualizado' });
});

router.get('/', role('gestor','financeiro'), (req, res) => {
  res.json({ message: 'Lista de materiais' });
});

module.exports = router;