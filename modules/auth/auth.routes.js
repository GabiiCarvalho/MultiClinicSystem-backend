const router = require('express').Router();
const auth = require('../../middleware/auth');
const { loginClinica, loginUsuario, getMe } = require('./auth.controller');

// Rotas públicas (sem token)
router.post('/clinica/login', loginClinica); // Login clinica (CNPJ)
router.post('/login', loginUsuario); // Login usuário

// Rotas protegidas
router.get('/me', auth, getMe);

module.exports = router;