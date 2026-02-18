const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Dashboard funcionando' });
});

router.get('/financeiro', (req, res) => {
    res.json({ message: 'Dados financeiros' });
});

router.get('/fluxo-pacientes', (req, res) => {
    res.json({ message: 'Fluxo de pacientes' });
});

router.get('/procedimentos/:id', (req, res) => {
    res.json({ message: `Métricas do procedimento ${req.params.id}` });
});

router.get('/dentistas/:id', (req, res) => {
    res.json({ message: `Métricas do dentista ${req.params.id}` });
});

module.exports = router;