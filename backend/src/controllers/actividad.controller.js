
const bd = require('../config/db');

// Obtener todas las actividades
exports.getAll = (req, res) => {
    bd.query("SELECT * FROM actividad", (error, results) => {
        if (error) {
            console.error(error);
            return res.status(500).send("Error al obtener actividades");
        }
        res.json(results);
    });
};

// Obtener una actividad por ID
exports.getById = (req, res) => {
    const id = req.params.id;

    bd.query("SELECT * FROM actividad WHERE id_actividad = ?", [id], (error, results) => {
        if (error) {
            return res.status(500).send("Error");
        }

        if (results.length === 0) {
            return res.status(404).send("No encontrada");
        }

        res.json(results[0]);
    });
};

// Crear nueva actividad
exports.create = (req, res) => {
    const {
        nombre_act,
        id_tipo,
        id_semestre,
        id_rol_organizador,
        fecha,
        hora_inicio,
        hora_fin,
        cupo_max,
        lugar,
        descripcion
    } = req.body;

    // Validación básica
    if (!nombre_act || !id_tipo || !id_semestre || !id_rol_organizador || !fecha || !hora_inicio || !hora_fin || !lugar) {
        return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    bd.query(
        `INSERT INTO actividad 
        (nombre_act, id_tipo, id_semestre, id_rol_organizador, fecha, hora_inicio, hora_fin, cupo_max, lugar, descripcion) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [nombre_act, id_tipo, id_semestre, id_rol_organizador, fecha, hora_inicio, hora_fin, cupo_max, lugar, descripcion],
        (error) => {
            if (error) {
                console.error(error);
                return res.status(500).send("Error al crear actividad");
            }

            res.status(201).send("Actividad creada");
        }
    );
};

// Eliminar una actividad por ID
exports.remove = (req, res) => {    
    const id = req.params.id;

    bd.query(
        "DELETE FROM actividad WHERE id_actividad = ?",
        [id],
        (error, result) => {
            if (error) {
                console.error(error);
                return res.status(500).send("Error al eliminar");
            }

            if (result.affectedRows === 0) {
                return res.status(404).send("Actividad no encontrada");
            }

            res.send("Actividad eliminada");
        }
    );
};

// Editar una actividad por ID
exports.update = (req, res) => {
    const id = req.params.id;

    const {
        nombre_act,
        id_tipo,
        id_semestre,
        id_rol_organizador,
        fecha,
        hora_inicio,
        hora_fin,
        cupo_max,
        lugar,
        descripcion
    } = req.body;

    bd.query(
        `UPDATE actividad SET 
        nombre_act = ?, 
        id_tipo = ?, 
        id_semestre = ?, 
        id_rol_organizador = ?, 
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
            id_rol_organizador,
            fecha,
            hora_inicio,
            hora_fin,
            cupo_max,
            lugar,
            descripcion,
            id
        ],
        (error, result) => {
            if (error) {
                console.error(error);
                return res.status(500).send("Error al actualizar");
            }

            if (result.affectedRows === 0) {
                return res.status(404).send("Actividad no encontrada");
            }

            res.send("Actividad actualizada");
        }
    );
};
