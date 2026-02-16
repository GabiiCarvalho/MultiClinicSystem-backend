const express = require('express');
const router = express.Router();

// Importar rotas
const authRoutes = require('./auth');
const usuarioRoutes = require('./usuarios');
const lojaRoutes = require('./lojas');
const pacienteRoutes = require('./pacientes');
const dentistaRoutes = require('./dentistas');
const categoriaRoutes = require('./categorias');
const procedimentoRoutes = require('./procedimentos');
const agendamentoRoutes = require('./agendamentos');
const vendaRoutes = require('./vendas');
const dashboardRoutes = require('./dashboard');
const materialRoutes = require('./materiais');

// Rotas públicas
router.use('/auth', authRoutes);

// Rotas protegidas
router.use('/usuarios', usuarioRoutes);
router.use('/lojas', lojaRoutes);
router.use('/pacientes', pacienteRoutes);
router.use('/dentistas', dentistaRoutes);
router.use('/categorias', categoriaRoutes);
router.use('/procedimentos', procedimentoRoutes);
router.use('/agendamentos', agendamentoRoutes);
router.use('/vendas', vendaRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/materiais', materialRoutes);

module.exports = router;