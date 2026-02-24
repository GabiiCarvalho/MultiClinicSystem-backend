const express = require('express');
const router = express.Router();
const ClinicaController = require('../controllers/ClinicaController');
const auth = require('../middlewares/auth.middleware');

router.use(auth);

router.get('/', ClinicaController.list);
router.post('/', ClinicaController.create);
router.get('/:id', ClinicaController.getById);
router.put('/:id', ClinicaController.update);
router.delete('/:id', ClinicaController.delete);

module.exports = router;