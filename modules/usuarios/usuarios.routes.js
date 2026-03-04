const router = require('express').Router();
const auth   = require('../../middleware/auth');
const { checkPermission } = require('../../middleware/rbac');
const ctrl   = require('./usuarios.controller');

router.use(auth);

// Apenas gestor/proprietário gerencia usuários
router.get('/',      checkPermission(['usuarios:read']),   ctrl.listarUsuarios);
router.post('/',     checkPermission(['usuarios:create']), ctrl.criarUsuario);
router.patch('/:id', checkPermission(['usuarios:update']), ctrl.atualizarUsuario);
router.delete('/:id',checkPermission(['usuarios:delete']), ctrl.desativarUsuario);

module.exports = router;