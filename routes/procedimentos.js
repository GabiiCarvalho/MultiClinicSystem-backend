const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Rota de procedimentos funcionando' });
});

router.post('/', (req, res) => {
    res.json({ message: 'Procedimento criado' });
});

router.get('/:id', (req, res) => {
    res.json({ message: `Procedimento ${req.params.id}` });
});

router.put('/:id', (req, res) => {
    res.json({ message: `Procedimento ${req.params.id} atualizado` });
});

router.patch('/:id/status', (req, res) => {
    res.json({ message: `Status do procedimento ${req.params.id} atualizado` });
});

module.exports = router;