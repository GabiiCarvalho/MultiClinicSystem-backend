const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

console.log('🔐 Auth routes carregadas');
console.log('  - login disponível:', !!authController.login);
console.log('  - cadastrarUsuario disponível:', !!authController.cadastrarUsuario);

// Rota de login
router.post('/login', authController.login);

// Rota de cadastro de usuário
router.post('/cadastrar-usuario', authController.cadastrarUsuario);

// Rota para listar usuários da loja (protegida)
router.get('/usuarios', authController.listarUsuariosPorLoja || ((req, res) => {
    res.json({ message: 'Lista de usuários' });
}));

module.exports = router;