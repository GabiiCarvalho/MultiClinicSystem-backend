const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard');
const authMiddleware = require('../middlewares/auth');

// Dashboard geral
router.get('/', authMiddleware, dashboardController.getDashboardData);

// Dados financeiros
router.get('/financeiro', authMiddleware, dashboardController.getFinancialOverview);

// Métricas por procedimento
router.get('/procedimentos/:procedimentoId', authMiddleware, dashboardController.getProcedureMetrics);

// Fluxo de pacientes
router.get('/fluxo-pacientes', authMiddleware, dashboardController.getPatientFlow);

// Métricas por dentista
router.get('/dentistas/:dentistaId', authMiddleware, dashboardController.getDentistMetrics);

module.exports = router;