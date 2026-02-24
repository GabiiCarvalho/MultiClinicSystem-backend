const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/pacientes', require('./pacientes'));
router.use('/dentistas', require('./dentistas'));
router.use('/categorias', require('./categorias'));
router.use('/procedimentos', require('./procedimentos'));
router.use('/materiais', require('./materiais'));
router.use('/financeiro', require('./financeiro'));

module.exports = router;