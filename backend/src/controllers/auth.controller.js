const db = require('../config/db');
const bcrypt = require("bcrypt");

exports.login = async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    const [result] = await db.query(`
      SELECT u.*, c.nombre_carrera
      FROM usuario u
      JOIN carrera c ON u.id_carrera = c.id_carrera
      WHERE u.correo = ?
    `, [correo]);

    if (result.length === 0) {
      return res.json({
        success: false,
        message: 'Correo o contraseña incorrectos'
      });
    }

    const user = result[0];

    // comparar contraseña ingresada vs hash guardado
    const match = await bcrypt.compare(
      contrasena,
      user.contrasena
    );

    if (!match) {
      return res.json({
        success: false,
        message: 'Correo o contraseña incorrectos'
      });
    }

    res.json({
      success: true,
      user
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: 'Error del servidor'
    });
  }
};