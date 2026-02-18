const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.json({ message: 'Rota de pacientes funcionando' });
});

router.post('/', (req, res) => {
    res.json({ message: 'Paciente criado' });
});

router.get('/buscar/:termo', (req, res) => {
    res.json({ message: `Buscando: ${req.params.termo}` });
});

router.get('/:id', (req, res) => {
    res.json({ message: `Paciente ${req.params.id}` });
});

router.put('/:id', (req, res) => {
    res.json({ message: `Paciente ${req.params.id} atualizado` });
});

router.get('/:id/agendamentos', (req, res) => {
    res.json({ message: `Agendamentos do paciente ${req.params.id}` });
});

module.exports = router;