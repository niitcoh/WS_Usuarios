const pool = require('../config/database');
const crypto = require('crypto');

class Token {
  static async getById(id) {
    const [rows] = await pool.query(
      'SELECT * FROM tokens WHERE id = ?',
      [id]
    );
    
    return rows.length ? rows[0] : null;
  }
  
  static async getByToken(token) {
    const [rows] = await pool.query(
      'SELECT * FROM tokens WHERE token = ?',
      [token]
    );
    
    return rows.length ? rows[0] : null;
  }
  
  static async getByUsuarioId(usuarioId, tipo) {
    let query = 'SELECT * FROM tokens WHERE usuario_id = ?';
    const params = [usuarioId];
    
    if (tipo) {
      query += ' AND tipo = ?';
      params.push(tipo);
    }
    
    const [rows] = await pool.query(query, params);
    
    return rows;
  }
  
  static async create(tokenData) {
    // Generar token aleatorio si no se proporciona
    const token = tokenData.token || crypto.randomBytes(20).toString('hex');
    
    // Calcular fecha de expiración si no se proporciona
    const ahora = new Date();
    const expiracion = tokenData.fecha_expiracion || new Date(ahora.getTime() + 3600000); // 1 hora por defecto
    
    const [result] = await pool.query(
      `INSERT INTO tokens (
        usuario_id, token, tipo, fecha_expiracion, usado
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        tokenData.usuario_id,
        token,
        tokenData.tipo,
        expiracion,
        tokenData.usado || false
      ]
    );
    
    return { id: result.insertId, token };
  }
  
  static async createRecoveryToken(usuarioId) {
    // Invalidar tokens de recuperación anteriores
    await pool.query(
      `UPDATE tokens SET usado = TRUE 
       WHERE usuario_id = ? AND tipo = 'reset_password' AND usado = FALSE`,
      [usuarioId]
    );
    
    // Crear nuevo token
    return this.create({
      usuario_id: usuarioId,
      tipo: 'reset_password',
      fecha_expiracion: new Date(Date.now() + 3600000) // 1 hora
    });
  }
  
  static async validateToken(token, tipo) {
    const [rows] = await pool.query(
      `SELECT * FROM tokens 
       WHERE token = ? AND tipo = ? AND usado = FALSE 
       AND fecha_expiracion > NOW()`,
      [token, tipo]
    );
    
    return rows.length ? rows[0] : null;
  }
  
  static async markAsUsed(id) {
    const [result] = await pool.query(
      'UPDATE tokens SET usado = TRUE WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }
  
  static async delete(id) {
    const [result] = await pool.query(
      'DELETE FROM tokens WHERE id = ?',
      [id]
    );
    
    return result.affectedRows > 0;
  }
  
  static async deleteExpired() {
    const [result] = await pool.query(
      'DELETE FROM tokens WHERE fecha_expiracion < NOW()'
    );
    
    return result.affectedRows;
  }
}

module.exports = Token;