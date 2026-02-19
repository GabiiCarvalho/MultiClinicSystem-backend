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
const pagamentoRoutes = require('./pagamentos');
const pessoaRoutes = require('./pessoas');

// Log para debug
console.log('📦 Rotas carregadas:');
console.log('  - auth:', !!authRoutes);
console.log('  - usuarios:', !!usuarioRoutes);
console.log('  - lojas:', !!lojaRoutes);
console.log('  - pacientes:', !!pacienteRoutes);
console.log('  - dentistas:', !!dentistaRoutes);
console.log('  - categorias:', !!categoriaRoutes);
console.log('  - procedimentos:', !!procedimentoRoutes);
console.log('  - agendamentos:', !!agendamentoRoutes);
console.log('  - vendas:', !!vendaRoutes);
console.log('  - dashboard:', !!dashboardRoutes);
console.log('  - materiais:', !!materialRoutes);

// Rotas públicas
router.use('/auth', authRoutes);

// Rotas protegidas (serão adicionados middlewares depois)
router.use('/usuarios', usuarioRoutes);
router.use('/pessoas', pessoaRoutes);
router.use('/pagamentos', pagamentoRoutes);
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