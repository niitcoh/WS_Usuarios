const pool = require('./src/config/database');

async function verificarEstructura() {
  try {
    console.log('Conectando a la base de datos...');
    
    // Verificar las tablas
    const tablas = ['usuarios', 'direcciones', 'tokens'];
    
    for (const tabla of tablas) {
      const [rows] = await pool.query(`
        SELECT TABLE_NAME FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
      `, [tabla]);
      
      if (rows.length > 0) {
        console.log(`✅ Tabla ${tabla} existe`);
        
        // Verificar columnas
        const [columns] = await pool.query(`
          SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?
        `, [tabla]);
        
        console.log(`  Columnas: ${columns.map(c => c.COLUMN_NAME).join(', ')}`);
      } else {
        console.log(`❌ Tabla ${tabla} no existe`);
      }
    }
    
    // Verificar si existe un usuario admin
    const [admin] = await pool.query(`
      SELECT COUNT(*) as count FROM usuarios WHERE rol = 'admin'
    `);
    
    if (admin[0].count > 0) {
      console.log(`✅ Existe al menos un usuario admin`);
    } else {
      console.log(`⚠️ No existe ningún usuario admin. Creando uno por defecto...`);
      
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await pool.query(`
        INSERT INTO usuarios (
          rut, nombre, apellido, email, password, rol, activo
        ) VALUES (
          '11111111-1', 'Administrador', 'Sistema', 'admin@sistema.cl', ?, 'admin', TRUE
        )
      `, [hashedPassword]);
      
      console.log(`✅ Usuario admin creado exitosamente`);
    }
    
    console.log('Verificación completada exitosamente');
  } catch (error) {
    console.error('Error al verificar estructura:', error);
  } finally {
    await pool.end();
    console.log('Conexión cerrada');
  }
}

verificarEstructura();