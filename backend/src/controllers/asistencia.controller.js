const db = require('../config/db');

// POST /api/asistencias
// Body: { matricula, id_actividad, asistio }
// Usa sp_guardar_asistencia → upsert automático (inserta si no existe, actualiza si ya existe)
// ✅ Así debe quedar
const guardarAsistencia = async (req, res) => {
    const { matricula, id_actividad, asistio } = req.body;
    if (!matricula || id_actividad === undefined || asistio === undefined) {
        return res.status(400).json({ error: 'Faltan campos: matricula, id_actividad, asistio' });
    }
    try {
        await db.query(
            `CALL sp_guardar_asistencia(?, ?, ?)`,
            [matricula, id_actividad, asistio] // ← sin conversión
        );
        res.json({ ok: true, mensaje: 'Asistencia guardada correctamente' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/asistencias/:matricula/:id_actividad/estatus
// Usa fn_usuario_asistio_actividad → "Asistió" / "No asistió" / "Sin registro"
const getEstatusAsistencia = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                CASE
                    WHEN a.matricula IS NULL THEN
                        CASE
                            WHEN act.fecha < CURDATE() THEN 'Cerrada'
                            ELSE 'Disponible'
                        END
                    WHEN a.asistio = 1 THEN 'Completada'
                    WHEN a.asistio = 2 THEN 'Disponible'
                    WHEN a.asistio = 0 THEN 'Inscrito'
                    ELSE 'Cerrada'
                END AS estatus
            FROM actividad act
            LEFT JOIN asistencia a
                ON a.id_actividad = act.id_actividad
                AND a.matricula = ?
            WHERE act.id_actividad = ?
        `, [req.params.matricula, req.params.id_actividad]);

        res.json({ estatus: rows[0]?.estatus ?? 'Cerrada' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
module.exports = {
    guardarAsistencia,
    getEstatusAsistencia,
};