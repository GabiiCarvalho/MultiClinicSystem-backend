const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');

router.use(auth);

// gestor e financeiro podem acessar
router.get('/caixa', role('gestor','financeiro'), (req, res) => {
  res.json({ message: 'Resumo de caixa' });
});

router.get('/relatorios', role('gestor','financeiro'), (req, res) => {
  res.json({ message: 'Relatórios financeiros' });
});

router.post('/pagamento', role('gestor','financeiro'), (req, res) => {
  res.json({ message: 'Pagamento registrado' });
});

module.exports = router;