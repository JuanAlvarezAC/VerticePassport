const db = require('../config/db');

// GET /api/semestres
const getSemestres = async (req, res) => {
    try {
        const [rows] = await db.query(`SELECT * FROM semestre ORDER BY inicio_fecha`);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/semestres/activo
const getSemestreActivo = async (req, res) => {
    try {
        const [rows] = await db.query(`SELECT * FROM semestre WHERE activo = 1 LIMIT 1`);
        if (rows.length === 0) return res.status(404).json({ error: 'No hay semestre activo' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/semestres/activo/roles
const getRolesSemestreActivo = async (req, res) => {
    try {
        const [rows] = await db.query(`SELECT * FROM vw_roles_semestre_activo`);
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getSemestres,
    getSemestreActivo,
    getRolesSemestreActivo,
};