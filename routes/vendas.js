const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Rota de vendas funcionando' });
});

router.post('/', (req, res) => {
    res.json({ message: 'Venda criada' });
});

router.get('/relatorio/periodo', (req, res) => {
    res.json({ message: 'Relatório por período' });
});

router.get('/relatorio/procedimentos', (req, res) => {
    res.json({ message: 'Relatório de procedimentos' });
});

router.get('/relatorio/dentista/:id', (req, res) => {
    res.json({ message: `Relatório do dentista ${req.params.id}` });
});

router.get('/relatorio/pagamentos', (req, res) => {
    res.json({ message: 'Relatório de pagamentos' });
});

router.get('/:id', (req, res) => {
    res.json({ message: `Venda ${req.params.id}` });
});

router.delete('/:id', (req, res) => {
    res.json({ message: `Venda ${req.params.id} removida` });
});

module.exports = router;