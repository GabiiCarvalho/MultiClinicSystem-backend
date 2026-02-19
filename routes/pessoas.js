const express = require('express');
const router = express.Router();
const pessoaController = require('../controllers/pessoaController');
const authMiddleware = require('../middlewares/auth');

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Rotas para colaboradores (funcionários)
router.get('/colaboradores', pessoaController.listarColaboradores);
router.post('/colaboradores', pessoaController.criarColaborador);
router.get('/colaboradores/:id', pessoaController.buscarColaborador);
router.put('/colaboradores/:id', pessoaController.atualizarColaborador);
router.delete('/colaboradores/:id', pessoaController.deletarColaborador);

// Rota específica para dentistas
router.get('/dentistas', pessoaController.listarDentistas);

module.exports = router;