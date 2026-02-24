const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');

router.use(auth);

router.post('/', (req, res) => {
  res.json({ message: 'Pagamento criado' });
});

router.get('/', (req, res) => {
  res.json({ message: 'Lista de pagamentos' });
});

router.get('/:id', (req, res) => {
  res.json({ message: 'Pagamento específico' });
});

module.exports = router;