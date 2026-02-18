const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Rota de materiais funcionando' });
});

router.post('/', (req, res) => {
    res.json({ message: 'Material criado' });
});

router.get('/estoque/baixo', (req, res) => {
    res.json({ message: 'Materiais com estoque baixo' });
});

router.get('/:id', (req, res) => {
    res.json({ message: `Material ${req.params.id}` });
});

router.put('/:id', (req, res) => {
    res.json({ message: `Material ${req.params.id} atualizado` });
});

router.delete('/:id', (req, res) => {
    res.json({ message: `Material ${req.params.id} removido` });
});

module.exports = router;