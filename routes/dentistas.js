const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Rota de dentistas funcionando' });
});

router.post('/', (req, res) => {
    res.json({ message: 'Dentista criado' });
});

router.get('/:id', (req, res) => {
    res.json({ message: `Dentista ${req.params.id}` });
});

router.put('/:id', (req, res) => {
    res.json({ message: `Dentista ${req.params.id} atualizado` });
});

router.get('/:id/agendamentos', (req, res) => {
    res.json({ message: `Agendamentos do dentista ${req.params.id}` });
});

module.exports = router;