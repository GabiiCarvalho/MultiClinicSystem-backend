const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const role = require('../middlewares/role');

router.use(auth);

router.get('/', (req, res) => {
  res.json({ message: 'Lista de categorias' });
});

router.post('/', role('gestor'), (req, res) => {
  res.json({ message: 'Categoria criada' });
});

router.put('/:id', role('gestor'), (req, res) => {
  res.json({ message: 'Categoria atualizada' });
});

module.exports = router;