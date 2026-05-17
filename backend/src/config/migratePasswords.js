const bcrypt = require('bcryptjs');
const db = require('./db');

async function migratePasswords() {
  try {

    // Obtener usuarios
    const [usuarios] = await db.query('SELECT * FROM usuario');

    for (const usuario of usuarios) {

      // Evitar hashear dos veces
      if (!usuario.contrasena.startsWith('$2')) {

        // Hashear contraseña
        const hashedPassword = await bcrypt.hash(usuario.contrasena, 10);

        // Actualizar DB
        await db.query(
          'UPDATE usuario SET contrasena = ? WHERE matricula = ?',
          [hashedPassword, usuario.matricula]
        );

        console.log(`✅ Usuario ${usuario.matricula} actualizado`);
      }
    }

    console.log('🎉 Migración terminada');
    process.exit();

  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
}

migratePasswords();