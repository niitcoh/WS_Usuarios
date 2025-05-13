const pool = require('../config/database');

exports.getAllRoles = async (req, res) => {
  try {
    const [roles] = await pool.query('SELECT * FROM roles ORDER BY id');
    res.status(200).json(roles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener roles' });
  }
};

exports.getRolById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM roles WHERE id = ?',
      [req.params.id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }
    
    res.status(200).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el rol' });
  }
};

exports.createRol = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    
    if (!nombre) {
      return res.status(400).json({ message: 'El nombre es requerido' });
    }
    
    // Verificar si ya existe un rol con ese nombre
    const [existente] = await pool.query('SELECT id FROM roles WHERE nombre = ?', [nombre]);
    
    if (existente.length > 0) {
      return res.status(400).json({ message: 'Ya existe un rol con ese nombre' });
    }
    
    const [result] = await pool.query(
      'INSERT INTO roles (nombre, descripcion) VALUES (?, ?)',
      [nombre, descripcion || null]
    );
    
    res.status(201).json({
      id: result.insertId,
      nombre,
      descripcion
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el rol' });
  }
};

exports.updateRol = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;
    
    if (!nombre) {
      return res.status(400).json({ message: 'El nombre es requerido' });
    }
    
    // Verificar si ya existe un rol con ese nombre (que no sea el mismo rol)
    const [existente] = await pool.query(
      'SELECT id FROM roles WHERE nombre = ? AND id != ?',
      [nombre, req.params.id]
    );
    
    if (existente.length > 0) {
      return res.status(400).json({ message: 'Ya existe un rol con ese nombre' });
    }
    
    const [result] = await pool.query(
      'UPDATE roles SET nombre = ?, descripcion = ? WHERE id = ?',
      [nombre, descripcion || null, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }
    
    res.status(200).json({
      id: parseInt(req.params.id),
      nombre,
      descripcion
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al actualizar el rol' });
  }
};

exports.deleteRol = async (req, res) => {
  try {
    // Verificar si hay usuarios con este rol
    const [usuarios] = await pool.query(
      'SELECT COUNT(*) as count FROM usuarios WHERE rol_id = ?',
      [req.params.id]
    );
    
    if (usuarios[0].count > 0) {
      return res.status(400).json({ 
        message: 'No se puede eliminar el rol porque está asignado a uno o más usuarios'
      });
    }
    
    const [result] = await pool.query(
      'DELETE FROM roles WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Rol no encontrado' });
    }
    
    res.status(200).json({ message: 'Rol eliminado exitosamente' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al eliminar el rol' });
  }
};
