const express = require('express');
const router = express.Router();

// Rota de teste
router.get('/', (req, res) => {
    res.json({ message: 'Rota de agendamentos funcionando' });
});

router.post('/', (req, res) => {
    res.json({ message: 'Agendamento criado' });
});

router.get('/:id', (req, res) => {
    res.json({ message: `Agendamento ${req.params.id}` });
});

router.put('/:id/status', (req, res) => {
    res.json({ message: `Status do agendamento ${req.params.id} atualizado` });
});

module.exports = router;