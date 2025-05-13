const Usuario = require('../models/usuario.model');
const Direccion = require('../models/direccion.model');
const pool = require('../config/database');

exports.getAllUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.getAll();
    res.status(200).json(usuarios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

exports.getUsuarioById = async (req, res) => {
  try {
    const usuario = await Usuario.getById(req.params.id);
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.status(200).json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el usuario' });
  }
};

exports.updateUsuario = async (req, res) => {
  try {
    // Verificar si es el propio usuario o un admin
    const esPropio = req.user.id === parseInt(req.params.id);
    const esAdmin = req.user.rol === 'admin';
    
    if (!esPropio && !esAdmin) {
      return res.status(403).json({ message: 'No tienes permiso para actualizar este usuario' });
    }
    
    // Si es admin, puede actualizar cualquier campo
    // Si es el propio usuario, solo puede actualizar ciertos campos
    const datosActualizacion = esAdmin ? req.body : {
      nombre: req.body.nombre,
      apellido: req.body.apellido,
      telefono: req.body.telefono
    };
    
    const resultado = await Usuario.update(req.params.id, datosActualizacion);
    
    if (!resultado) {
      return res.status(404).json({ message: 'Usuario no encontrado o no se proporcionaron datos para actualizar' });
    }
    
    const usuarioActualizado = await Usuario.getById(req.params.id);
    
    res.status(200).json({
      message: 'Usuario actualizado exitosamente',
      usuario: usuarioActualizado
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el usuario' });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.params.id;
    
    // Verificar si es el propio usuario o un admin
    const esPropio = req.user.id === parseInt(userId);
    const esAdmin = req.user.rol === 'admin';
    
    if (!esPropio && !esAdmin) {
      return res.status(403).json({ message: 'No tienes permiso para cambiar la contraseña de este usuario' });
    }
    
    // Si es el propio usuario, verificar contraseña actual
    if (esPropio && !esAdmin) {
      // Obtener el usuario completo con password
      const [usuario] = await pool.query('SELECT * FROM usuarios WHERE id = ?', [userId]);
      
      if (usuario.length === 0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
      }
      
      const passwordValida = await Usuario.validatePassword(currentPassword, usuario[0].password);
      
      if (!passwordValida) {
        return res.status(400).json({ message: 'Contraseña actual incorrecta' });
      }
    }
    
    // Cambiar contraseña
    await Usuario.changePassword(userId, newPassword);
    
    res.status(200).json({ message: 'Contraseña actualizada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al cambiar la contraseña' });
  }
};

exports.deleteUsuario = async (req, res) => {
  try {
    // Solo admin puede eliminar usuarios
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ message: 'No tienes permiso para eliminar usuarios' });
    }
    
    const resultado = await Usuario.delete(req.params.id);
    
    if (!resultado) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    res.status(200).json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el usuario' });
  }
};
