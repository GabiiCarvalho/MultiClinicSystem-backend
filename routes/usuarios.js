const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Rota de usuários funcionando' });
});

router.get('/dentistas', (req, res) => {
    res.json({ message: 'Lista de dentistas' });
});

router.post('/', (req, res) => {
    res.json({ message: 'Usuário criado' });
});

router.get('/:id', (req, res) => {
    res.json({ message: `Usuário ${req.params.id}` });
});

router.put('/:id', (req, res) => {
    res.json({ message: `Usuário ${req.params.id} atualizado` });
});

router.delete('/:id', (req, res) => {
    res.json({ message: `Usuário ${req.params.id} removido` });
});

module.exports = router;