const pool = require('../config/database');

class Direccion {
  static async getById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM direcciones WHERE id = ?',
      [id]
    );
    
    return rows.length ? rows[0] : null;
  }
  
  static async getByUsuarioId(usuarioId) {
    const [rows] = await pool.query(
      'SELECT * FROM direcciones WHERE usuario_id = ?',
      [usuarioId]
    );
    
    return rows;
  }
  
  static async create(direccionData) {
    // Si se marca como predeterminada, quitar predeterminada de otras direcciones
    if (direccionData.predeterminada) {
      await pool.query(
        'UPDATE direcciones SET predeterminada = FALSE WHERE usuario_id = ?',
        [direccionData.usuario_id]
      );
    }
    
    const [result] = await pool.query(
      `INSERT INTO direcciones (
        usuario_id, direccion, comuna, ciudad, region, 
        codigo_postal, telefono, instrucciones, predeterminada
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        direccionData.usuario_id,
        direccionData.direccion,
        direccionData.comuna,
        direccionData.ciudad,
        direccionData.region,
        direccionData.codigo_postal || null,
        direccionData.telefono || null,
        direccionData.instrucciones || null,
        direccionData.predeterminada || false
      ]
    );
    
    return result.insertId;
  }
  
  static async update(id, direccionData) {
    // Si se marca como predeterminada, quitar predeterminada de otras direcciones
    if (direccionData.predeterminada) {
      const [direccion] = await pool.query('SELECT usuario_id FROM direcciones WHERE id = ?', [id]);
      
      if (direccion.length > 0) {
        await pool.query(
          'UPDATE direcciones SET predeterminada = FALSE WHERE usuario_id = ? AND id != ?',
          [direccion[0].usuario_id, id]
        );
      }
    }
    
    let updateQuery = 'UPDATE direcciones SET ';
    const updateValues = [];
    
    // Construir la consulta dinámicamente con los campos proporcionados
    for (const [key, value] of Object.entries(direccionData)) {
      if (key !== 'id' && key !== 'usuario_id') {
        updateQuery += `${key} = ?, `;
        updateValues.push(value);
      }
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
  
  static async delete(id) {
    // Verificar si la dirección a eliminar es predeterminada
    const [direccion] = await pool.query(
      'SELECT usuario_id, predeterminada FROM direcciones WHERE id = ?',
      [id]
    );
    
    if (direccion.length > 0 && direccion[0].predeterminada) {
      // Contar cuántas direcciones tiene el usuario
      const [countResult] = await pool.query(
        'SELECT COUNT(*) as count FROM direcciones WHERE usuario_id = ?',
        [direccion[0].usuario_id]
      );
      
      // Si tiene más de 1 dirección, establecer otra como predeterminada
      if (countResult[0].count > 1) {
        await pool.query(
          `UPDATE direcciones SET predeterminada = TRUE 
           WHERE usuario_id = ? AND id != ? 
           LIMIT 1`,
          [direccion[0].usuario_id, id]
        );
      }
    }
    
    const [result] = await pool.query(
      'DELETE FROM direcciones WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }
}

module.exports = Direccion;