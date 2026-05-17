const db = require('../config/db');
const axios = require('axios');

const PEXELS_API_KEY = "2CShh991gVz4IdLJ3P6D3gibhKAWsrvquBZqygyz59zx54L1vLxq10Qo";

// Función para obtener imagen de Pexels usando el nombre de la actividad como keyword
const getPexelsImage = async (nombre) => {
    try {
        const clean = nombre
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

        const query = encodeURIComponent(clean);

        const res = await axios.get(
            `https://api.pexels.com/v1/search?query=${query}&per_page=1`,
            { headers: { Authorization: PEXELS_API_KEY } }
        );

        return res.data.photos[0]?.src.medium || null;

    } catch (error) {
        console.error("Error Pexels:", error.message);
        return null;
    }
};

// GET /api/actividad — Obtener todas las actividades
exports.getAll = async (req, res) => {
    try {
        const [results] = await db.query(`
            SELECT a.*, t.puntos_fijos
            FROM actividad a
            JOIN tipo_actividad t ON a.id_tipo = t.id_tipo
        `);
        res.json(results);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al obtener actividades");
    }
};

// GET /api/actividad/:id — Obtener una actividad por ID (con imagen Pexels)
exports.getById = async (req, res) => {
    try {
        const [results] = await db.query(
            `SELECT * FROM vw_calendario_actividades WHERE id_actividad = ?`,
            [req.params.id]
        );

        if (results.length === 0) return res.status(404).send("No encontrada");

        const act = results[0];
        const imagen = await getPexelsImage(act.nombre_evento);

        res.json({ ...act, imagen });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error");
    }
};

// POST /api/actividad — Crear nueva actividad
exports.create = async (req, res) => {
    const {
        nombre_act, id_tipo, id_semestre, id_rol_organizador,
        fecha, hora_inicio, hora_fin, cupo_max, lugar, descripcion
    } = req.body;

    if (!nombre_act || !id_tipo || !id_semestre || !id_rol_organizador || !fecha || !hora_inicio || !hora_fin || !lugar) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    try {
        await db.query(
            `INSERT INTO actividad 
            (nombre_act, id_tipo, id_semestre, id_rol_organizador, fecha, hora_inicio, hora_fin, cupo_max, lugar, descripcion)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [nombre_act, id_tipo, id_semestre, id_rol_organizador, fecha, hora_inicio, hora_fin, cupo_max, lugar, descripcion]
        );
        res.status(201).send("Actividad creada");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al crear actividad");
    }
};

// PUT /api/actividad/:id — Actualizar una actividad
exports.update = async (req, res) => {
    const {
        nombre_act,
        id_tipo,
        id_semestre,
        fecha,
        hora_inicio,
        hora_fin,
        cupo_max,
        lugar,
        descripcion
    } = req.body;

    try {
        const [result] = await db.query(
            `UPDATE actividad SET
            nombre_act = ?,
            id_tipo = ?,
            id_semestre = ?,
            fecha = ?,
            hora_inicio = ?,
            hora_fin = ?,
            cupo_max = ?,
            lugar = ?,
            descripcion = ?
            WHERE id_actividad = ?`,
            [
                nombre_act,
                id_tipo,
                id_semestre,
                fecha,
                hora_inicio,
                hora_fin,
                cupo_max,
                lugar,
                descripcion,
                req.params.id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).send("Actividad no encontrada");
        }

        res.json({ ok: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            error: error.message
        });
    }
};

// DELETE /api/actividad/:id — Eliminar una actividad
exports.remove = async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM actividad WHERE id_actividad = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) return res.status(404).send("Actividad no encontrada");
        res.send("Actividad eliminada");
    } catch (error) {
        console.error(error);
        res.status(500).send("Error al eliminar");
    }
};

// GET /api/actividad/calendario — Calendario del semestre activo
exports.getCalendarioActivo = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT * FROM vw_calendario_actividades
             WHERE nombre_semestre = (
                 SELECT nombre_semestre FROM semestre WHERE activo = 1 LIMIT 1
             )
             ORDER BY fecha, hora_inicio`
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// GET /api/actividad/calendario/:nombre_semestre — Calendario de un semestre específico
exports.getCalendarioPorSemestre = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT * FROM vw_calendario_actividades WHERE nombre_semestre = ?
             ORDER BY fecha, hora_inicio`,
            [req.params.nombre_semestre]
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// GET /api/actividad/:id/inscritos — Lista de inscritos a una actividad
exports.getInscritos = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT a.id_actividad, act.nombre_act,
                    u.matricula,
                    CONCAT(u.nombre, ' ', u.apellidos) AS nombre_completo,
                    a.asistio, a.puntos_otorgados, a.fecha_registro
             FROM asistencia a
             INNER JOIN usuario u ON a.matricula = u.matricula
             INNER JOIN actividad act ON a.id_actividad = act.id_actividad
             WHERE a.id_actividad = ?
             ORDER BY nombre_completo`,
            [req.params.id]
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};

// GET /api/actividad/:id/puntos — Puntos fijos de una actividad
exports.getPuntosActividad = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT fn_puntos_actividad(?) AS puntos`,
            [req.params.id]
        );
        res.json({ puntos: rows[0].puntos });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
};