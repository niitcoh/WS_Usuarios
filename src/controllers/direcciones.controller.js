const Direccion = require('../models/direccion.model');
const Usuario = require('../models/usuario.model');

exports.getDireccionesByUsuario = async (req, res) => {
  try {
    const usuarioId = req.params.usuarioId;
    
    // Verificar si es el propio usuario o un admin
    const esPropio = req.user.id === parseInt(usuarioId);
    const esAdmin = req.user.rol === 'admin';
    
    if (!esPropio && !esAdmin) {
      return res.status(403).json({ message: 'No tienes permiso para ver estas direcciones' });
    }
    
    const direcciones = await Direccion.getByUsuarioId(usuarioId);
    
    res.status(200).json(direcciones);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener direcciones' });
  }
};

exports.getDireccionById = async (req, res) => {
  try {
    const direccion = await Direccion.getById(req.params.id);
    
    if (!direccion) {
      return res.status(404).json({ message: 'Dirección no encontrada' });
    }
    
    // Verificar si es el propio usuario o un admin
    const esPropio = req.user.id === direccion.usuario_id;
    const esAdmin = req.user.rol === 'admin';
    
    if (!esPropio && !esAdmin) {
      return res.status(403).json({ message: 'No tienes permiso para ver esta dirección' });
    }
    
    res.status(200).json(direccion);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener la dirección' });
  }
};

exports.createDireccion = async (req, res) => {
  try {
    const { 
      usuario_id, 
      direccion, 
      comuna, 
      ciudad, 
      region, 
      codigo_postal, 
      telefono, 
      instrucciones, 
      predeterminada 
    } = req.body;
    
    // Verificar si es el propio usuario o un admin
    const esPropio = req.user.id === parseInt(usuario_id);
    const esAdmin = req.user.rol === 'admin';
    
    if (!esPropio && !esAdmin) {
      return res.status(403).json({ message: 'No tienes permiso para crear direcciones para este usuario' });
    }
    
    // Validaciones básicas
    if (!direccion || !comuna || !ciudad || !region) {
      return res.status(400).json({ message: 'Dirección, comuna, ciudad y región son campos requeridos' });
    }
    
    // Verificar que el usuario existe
    const usuario = await Usuario.getById(usuario_id);
    
    if (!usuario) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    
    const direccionId = await Direccion.create({
      usuario_id,
      direccion,
      comuna,
      ciudad,
      region,
      codigo_postal,
      telefono,
      instrucciones,
      predeterminada: predeterminada || false
    });
    
    const nuevaDireccion = await Direccion.getById(direccionId);
    
    res.status(201).json({
      message: 'Dirección creada exitosamente',
      direccion: nuevaDireccion
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear la dirección' });
  }
};

exports.updateDireccion = async (req, res) => {
  try {
    const direccionId = req.params.id;
    const direccionExistente = await Direccion.getById(direccionId);
    
    if (!direccionExistente) {
      return res.status(404).json({ message: 'Dirección no encontrada' });
    }
    
    // Verificar si es el propio usuario o un admin
    const esPropio = req.user.id === direccionExistente.usuario_id;
    const esAdmin = req.user.rol === 'admin';
    
    if (!esPropio && !esAdmin) {
      return res.status(403).json({ message: 'No tienes permiso para actualizar esta dirección' });
    }
    
    const resultado = await Direccion.update(direccionId, req.body);
    
    if (!resultado) {
      return res.status(400).json({ message: 'No se proporcionaron datos para actualizar' });
    }
    
    const direccionActualizada = await Direccion.getById(direccionId);
    
    res.status(200).json({
      message: 'Dirección actualizada exitosamente',
      direccion: direccionActualizada
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar la dirección' });
  }
};

exports.deleteDireccion = async (req, res) => {
  try {
    const direccionId = req.params.id;
    const direccionExistente = await Direccion.getById(direccionId);
    
    if (!direccionExistente) {
      return res.status(404).json({ message: 'Dirección no encontrada' });
    }
    
    // Verificar si es el propio usuario o un admin
    const esPropio = req.user.id === direccionExistente.usuario_id;
    const esAdmin = req.user.rol === 'admin';
    
    if (!esPropio && !esAdmin) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar esta dirección' });
    }
    
    await Direccion.delete(direccionId);
    
    res.status(200).json({ message: 'Dirección eliminada exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar la dirección' });
  }
};

exports.setDireccionPredeterminada = async (req, res) => {
  try {
    const direccionId = req.params.id;
    const direccionExistente = await Direccion.getById(direccionId);
    
    if (!direccionExistente) {
      return res.status(404).json({ message: 'Dirección no encontrada' });
    }
    
    // Verificar si es el propio usuario o un admin
    const esPropio = req.user.id === direccionExistente.usuario_id;
    const esAdmin = req.user.rol === 'admin';
    
    if (!esPropio && !esAdmin) {
      return res.status(403).json({ message: 'No tienes permiso para actualizar esta dirección' });
    }
    
    // Establecer como predeterminada
    await Direccion.update(direccionId, { predeterminada: true });
    
    res.status(200).json({ message: 'Dirección establecida como predeterminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al establecer dirección predeterminada' });
  }
};