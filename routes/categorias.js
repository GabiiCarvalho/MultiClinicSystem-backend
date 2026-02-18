const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Rota de categorias funcionando' });
});

router.post('/', (req, res) => {
    res.json({ message: 'Categoria criada' });
});

router.get('/:id', (req, res) => {
    res.json({ message: `Categoria ${req.params.id}` });
});

router.put('/:id', (req, res) => {
    res.json({ message: `Categoria ${req.params.id} atualizada` });
});

router.get('/:id/procedimentos', (req, res) => {
    res.json({ message: `Procedimentos da categoria ${req.params.id}` });
});

module.exports = router;