const db = require('../config/db');

const getCarreras = async (req, res) => {
    try {
        const [rows] = await db.query(
            'SELECT * FROM carrera ORDER BY nombre_carrera'
        );

        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getCarreras
};