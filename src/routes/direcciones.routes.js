const express = require('express');
const router = express.Router();
const direccionesController = require('../controllers/direcciones.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware.verificarToken);

// Rutas de direcciones
router.get('/usuario/:usuarioId', direccionesController.getDireccionesByUsuario);
router.get('/:id', direccionesController.getDireccionById);
router.post('/', direccionesController.createDireccion);
router.put('/:id', direccionesController.updateDireccion);
router.delete('/:id', direccionesController.deleteDireccion);
router.patch('/:id/predeterminada', direccionesController.setDireccionPredeterminada);

module.exports = router;