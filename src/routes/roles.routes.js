const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/roles.controller');
const authMiddleware = require('../middleware/auth.middleware');
const rolesMiddleware = require('../middleware/roles.middleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware.verificarToken);

// Rutas para administradores
router.use(rolesMiddleware.esAdmin);

router.get('/', rolesController.getAllRoles);
router.get('/:id', rolesController.getRolById);
router.post('/', rolesController.createRol);
router.put('/:id', rolesController.updateRol);
router.delete('/:id', rolesController.deleteRol);

module.exports = router;