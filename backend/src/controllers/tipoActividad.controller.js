const db = require('../config/db');

const getTiposActividad = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM tipo_actividad ORDER BY nombre_tipo'
        );

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getTiposActividad
};