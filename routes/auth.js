const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// Rota de login
router.post('/login', authController.login);

// Rota de cadastro de gestor
router.post('/cadastrar-gestor', authController.cadastrarGestor);

module.exports = router;