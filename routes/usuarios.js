const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarios');
const authMiddleware = require('../middlewares/auth');
const lojaMiddleware = require('../middlewares/loja');

router.get('/dentistas', authMiddleware, lojaMiddleware, usuarioController.listarDentistas);
router.get('/', authMiddleware, lojaMiddleware, usuarioController.listarUsuariosPorCargo);
router.post('/', authMiddleware, lojaMiddleware, usuarioController.criarUsuario);

module.exports = router;