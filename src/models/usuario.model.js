const pool = require('../config/database');
const bcrypt = require('bcrypt');

class Usuario {
  static async getAll() {
    const [rows] = await pool.query(
      `SELECT id, rut, nombre, apellido, email, telefono, rol, 
      activo, ultimo_acceso, fecha_registro, created_at, updated_at
      FROM usuarios`
    );
    
    return rows;
  }
  
  static async getById(id) {
    const [rows] = await pool.query(
      `SELECT id, rut, nombre, apellido, email, telefono, rol, 
      activo, ultimo_acceso, fecha_registro, created_at, updated_at
      FROM usuarios
      WHERE id = ?`,
      [id]
    );
    
    if (rows.length === 0) return null;
    
    // Obtener las direcciones del usuario
    const usuario = rows[0];
    usuario.direcciones = await this.getDireccionesByUsuarioId(id);
    
    return usuario;
  }
  
  static async getByEmail(email) {
    const [rows] = await pool.query(
      `SELECT * FROM usuarios WHERE email = ?`,
      [email]
    );
    
    return rows.length ? rows[0] : null;
  }
  
  static async getByRut(rut) {
    const [rows] = await pool.query(
      `SELECT * FROM usuarios WHERE rut = ?`,
      [rut]
    );
    
    return rows.length ? rows[0] : null;
  }
  
  static async getDireccionesByUsuarioId(usuarioId) {
    const [rows] = await pool.query(
      `SELECT * FROM direcciones WHERE usuario_id = ?`,
      [usuarioId]
    );
    
    return rows;
  }
  
  static async create(userData) {
    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    const [result] = await pool.query(
      `INSERT INTO usuarios (
        rut, nombre, apellido, email, password, telefono, rol
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userData.rut,
        userData.nombre,
        userData.apellido || 'No especificado',
        userData.email,
        hashedPassword,
        userData.telefono || null,
        userData.rol || 'cliente'
      ]
    );
    
    // Si se proporcionó una dirección, crearla
    if (userData.direccion) {
      await pool.query(
        `INSERT INTO direcciones (
          usuario_id, direccion, comuna, ciudad, region, predeterminada
        ) VALUES (?, ?, ?, ?, ?, TRUE)`,
        [
          result.insertId,
          userData.direccion,
          userData.comuna || 'No especificada',
          userData.ciudad || 'No especificada',
          userData.region || 'No especificada'
        ]
      );
    }
    
    return result.insertId;
  }
  
  static async update(id, userData) {
    let updateQuery = 'UPDATE usuarios SET ';
    const updateValues = [];
    
    // Construir la consulta dinámicamente con los campos proporcionados
    if (userData.nombre) {
      updateQuery += 'nombre = ?, ';
      updateValues.push(userData.nombre);
    }
    
    if (userData.apellido) {
      updateQuery += 'apellido = ?, ';
      updateValues.push(userData.apellido);
    }
    
    if (userData.rut) {
      updateQuery += 'rut = ?, ';
      updateValues.push(userData.rut);
    }
    
    if (userData.telefono !== undefined) {
      updateQuery += 'telefono = ?, ';
      updateValues.push(userData.telefono);
    }
    
    if (userData.rol) {
      updateQuery += 'rol = ?, ';
      updateValues.push(userData.rol);
    }
    
    if (userData.activo !== undefined) {
      updateQuery += 'activo = ?, ';
      updateValues.push(userData.activo);
    }
    
    // Si no hay campos para actualizar
    if (updateValues.length === 0) {
      return false;
    }
    
    // Eliminar la última coma y espacio
    updateQuery = updateQuery.slice(0, -2);
    
    // Agregar condición WHERE
    updateQuery += ' WHERE id = ?';
    updateValues.push(id);
    
    const [result] = await pool.query(updateQuery, updateValues);
    return result.affectedRows > 0;
  }
  
  static async changePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const [result] = await pool.query(
      'UPDATE usuarios SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );
    
    return result.affectedRows > 0;
  }
  
  static async delete(id) {
    // Las direcciones se eliminarán automáticamente por la restricción ON DELETE CASCADE
    const [result] = await pool.query(
      'DELETE FROM usuarios WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }
  
  static async validatePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }
  
  static async updateLastAccess(id) {
    await pool.query(
      'UPDATE usuarios SET ultimo_acceso = NOW() WHERE id = ?',
      [id]
    );
  }
}

module.exports = Usuario;