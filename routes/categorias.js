const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categorias');
const authMiddleware = require('../middlewares/auth');
const lojaMiddleware = require('../middlewares/loja');

router.get('/', authMiddleware, lojaMiddleware, categoriaController.listar);
router.post('/', authMiddleware, lojaMiddleware, categoriaController.criar);
router.get('/:categoriaId', authMiddleware, lojaMiddleware, categoriaController.obterPorId);
router.put('/:categoriaId', authMiddleware, lojaMiddleware, categoriaController.atualizar);
router.get('/:categoriaId/procedimentos', authMiddleware, lojaMiddleware, categoriaController.listarProcedimentos);

module.exports = router;