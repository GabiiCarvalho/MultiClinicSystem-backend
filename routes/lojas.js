const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Rota de lojas funcionando' });
});

router.get('/estatisticas', (req, res) => {
    res.json({ message: 'Estatísticas das lojas' });
});

router.get('/:id', (req, res) => {
    res.json({ message: `Loja ${req.params.id}` });
});

router.put('/:id', (req, res) => {
    res.json({ message: `Loja ${req.params.id} atualizada` });
});

module.exports = router;