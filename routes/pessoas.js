const express = require('express');
const router = express.Router();
const PessoaController = require('../controllers/PessoaController');
const auth = require('../middlewares/auth.middleware');

router.use(auth);

router.get('/', PessoaController.list);
router.post('/', PessoaController.create);
router.get('/:id', PessoaController.getById);
router.put('/:id', PessoaController.update);
router.delete('/:id', PessoaController.delete);

module.exports = router;