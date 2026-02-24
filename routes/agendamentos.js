const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');

router.use(auth);

router.get('/', (req, res) => {
  res.json({ clinica: req.clinica_id });
});

router.post('/', (req, res) => {
  res.json({ message: 'Agendamento criado' });
});

router.patch('/:id/status', (req, res) => {
  res.json({ message: 'Status atualizado' });
});

router.delete('/:id', (req, res) => {
  res.json({ message: 'Agendamento removido' });
});

module.exports = router;