const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');

router.use(auth);

router.get('/resumo', (req, res) => {
  res.json({ message: 'Resumo geral' });
});

router.get('/financeiro', (req, res) => {
  res.json({ message: 'Financeiro da clínica' });
});

router.get('/dentistas/:id', (req, res) => {
  res.json({ message: 'Métricas do dentista' });
});

module.exports = router;