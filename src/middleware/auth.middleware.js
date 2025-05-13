const authConfig = require('../config/auth');
const Usuario = require('../models/usuario.model');

exports.verificarToken = async (req, res, next) => {
  try {
    // Obtener el token del header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Token no proporcionado' });
    }
    
    const token = authHeader.split(' ')[1];
    
    // Verificar el token
    const decoded = authConfig.verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({ message: 'Token inválido o expirado' });
    }
    
    // Verificar que el usuario existe y está activo
    const usuario = await Usuario.getById(decoded.id);
    
    if (!usuario) {
      return res.status(401).json({ message: 'Usuario no encontrado' });
    }
    
    if (!usuario.activo) {
      return res.status(401).json({ message: 'Usuario inactivo' });
    }
    
    // Agregar información del usuario al request
    req.user = usuario;
    
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error en la autenticación' });
  }
};
