const db = require('../config/db');

// GET /api/roles
const getRoles = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT id_rol, nombre, nivel FROM rol ORDER BY id_rol`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getRoles };