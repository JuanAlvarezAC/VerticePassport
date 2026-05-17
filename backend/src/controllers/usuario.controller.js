const db = require('../config/db');
const bcrypt = require('bcryptjs');

// GET /api/usuarios
const getUsuarios = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT matricula, nombre, apellidos, correo FROM usuario ORDER BY matricula`
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/usuarios/:matricula/perfil
const getPerfil = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT * FROM vw_perfil_usuario WHERE matricula = ?`,
            [req.params.matricula]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/usuarios/:matricula/puntos
const getPuntosTotales = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT * FROM vw_puntos_acumulados_usuario WHERE matricula = ?`,
            [req.params.matricula]
        );
        if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json(rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/usuarios/:matricula/puntos/:id_semestre
const getPuntosPorSemestre = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT fn_puntos_por_semestre(?, ?) AS puntos_semestre`,
            [req.params.matricula, req.params.id_semestre]
        );
        res.json({ puntos_semestre: rows[0].puntos_semestre });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/usuarios/:matricula/historial
const getHistorial = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT * FROM vw_historial_asistencias WHERE matricula = ?`,
            [req.params.matricula]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/usuarios/:matricula/roles
const getRoles = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT * FROM vw_roles_por_semestre WHERE matricula = ?`,
            [req.params.matricula]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/usuarios/:matricula/materias
const getMaterias = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT * FROM vw_materias_usuario WHERE matricula = ?`,
            [req.params.matricula]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/usuarios/:matricula/estatus-actividades
const getEstatusActividades = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT * FROM vw_estatus_actividades_usuario WHERE matricula = ?`,
            [req.params.matricula]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/usuarios/:matricula/generacion
const getGeneracion = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT fn_generacion(?) AS generacion`,
            [req.params.matricula]
        );
        res.json({ generacion: rows[0].generacion });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/usuarios/:matricula/rol-activo
const getRolActivo = async (req, res) => {
    try {
        const [rows] = await db.query(
            `SELECT 
                urs.matricula,
                r.id_rol,
                r.nombre AS rol,
                r.nivel,
                s.nombre_semestre,
                urs.estado
             FROM usuario_rol_semestre urs
             JOIN rol r ON urs.id_rol = r.id_rol
             JOIN semestre s ON urs.id_semestre = s.id_semestre
             WHERE urs.matricula = ?
               AND s.activo = 1
               AND urs.estado = 'Activo'
               AND r.nombre != 'Miembro'
             LIMIT 1`,
            [req.params.matricula]
        );

        if (rows.length === 0) {
            return res.json({ esAdmin: false, rol: null });
        }

        res.json({
            esAdmin: true,
            rol: rows[0].rol,
            nivel: rows[0].nivel,
            id_rol: rows[0].id_rol,
            nombre_semestre: rows[0].nombre_semestre
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET /api/usuarios/:matricula/actividades-a-gestionar
const getActividadesAGestionar = async (req, res) => {
    try {
        const [rolRows] = await db.query(
            `SELECT urs.id_rol, r.nombre AS nombre_rol
             FROM usuario_rol_semestre urs
             JOIN semestre s ON urs.id_semestre = s.id_semestre
             JOIN rol r ON urs.id_rol = r.id_rol
             WHERE urs.matricula = ?
               AND s.activo = 1
               AND urs.estado = 'Activo'
               AND r.nombre != 'Miembro'
             LIMIT 1`,
            [req.params.matricula]
        );

        if (rolRows.length === 0) {
            return res.status(403).json({ error: 'Sin permisos de gestión' });
        }

        const { id_rol, nombre_rol } = rolRows[0];

        const query = nombre_rol === 'Coordinación'
            ? `SELECT a.id_actividad, a.nombre_act, a.fecha, a.hora_inicio, a.hora_fin,
                      a.lugar, a.cupo_max, t.nombre_tipo, r.nombre AS rol_organizador
               FROM actividad a
               JOIN tipo_actividad t ON a.id_tipo = t.id_tipo
               JOIN rol r ON a.id_rol_organizador = r.id_rol
               JOIN semestre s ON a.id_semestre = s.id_semestre
               WHERE s.activo = 1
               ORDER BY a.fecha, a.hora_inicio`
            : `SELECT a.id_actividad, a.nombre_act, a.fecha, a.hora_inicio, a.hora_fin,
                      a.lugar, a.cupo_max, t.nombre_tipo, r.nombre AS rol_organizador
               FROM actividad a
               JOIN tipo_actividad t ON a.id_tipo = t.id_tipo
               JOIN rol r ON a.id_rol_organizador = r.id_rol
               JOIN semestre s ON a.id_semestre = s.id_semestre
               WHERE a.id_rol_organizador = ?
                 AND s.activo = 1
               ORDER BY a.fecha, a.hora_inicio`;

        const params = nombre_rol === 'Coordinación' ? [] : [id_rol];
        const [actRows] = await db.query(query, params);

        res.json(actRows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/usuarios
const createUsuario = async (req, res) => {
    try {
        const {
            matricula,
            nombre,
            apellidos,
            correo,
            contrasena,
            anio_entrada,
            id_carrera,
            id_rol,
            id_semestre,
        } = req.body;

        const hashedPassword = await bcrypt.hash(contrasena, 10);

        // 1. Insertar usuario
        await db.query(
            `INSERT INTO usuario
            (matricula, nombre, apellidos, correo, contrasena, anio_entrada, id_carrera)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [matricula, nombre, apellidos, correo, hashedPassword, anio_entrada, id_carrera]
        );

        // 2. Si se mandó rol y semestre, insertar en usuario_rol_semestre
        if (id_rol && id_semestre) {
            await db.query(
                `INSERT INTO usuario_rol_semestre (matricula, id_rol, id_semestre, estado)
                 VALUES (?, ?, ?, 'Activo')`,
                [matricula, id_rol, id_semestre]
            );
        }

        res.json({ ok: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// PUT /api/usuarios/:matricula
const updateUsuario = async (req, res) => {
    try {
        const {
            nombre,
            apellidos,
            correo,
            contrasena,
            anio_entrada,
            id_carrera,
            id_rol,
            id_semestre,
        } = req.body;

        // 1. Actualizar datos del usuario
        if (contrasena) {
            const hashedPassword = await bcrypt.hash(contrasena, 10);
            await db.query(
                `UPDATE usuario SET
                    nombre = ?,
                    apellidos = ?,
                    correo = ?,
                    contrasena = ?,
                    anio_entrada = ?,
                    id_carrera = ?
                WHERE matricula = ?`,
                [nombre, apellidos, correo, hashedPassword, anio_entrada, id_carrera, req.params.matricula]
            );
        } else {
            await db.query(
                `UPDATE usuario SET
                    nombre = ?,
                    apellidos = ?,
                    correo = ?,
                    anio_entrada = ?,
                    id_carrera = ?
                WHERE matricula = ?`,
                [nombre, apellidos, correo, anio_entrada, id_carrera, req.params.matricula]
            );
        }

        // 2. Si se mandó rol y semestre, actualizar o insertar en usuario_rol_semestre
        // Si ya existe el registro (misma matrícula + semestre), actualiza el rol.
        // Si no existe, lo inserta.
        if (id_rol && id_semestre) {
            await db.query(
                `INSERT INTO usuario_rol_semestre (matricula, id_rol, id_semestre, estado)
                 VALUES (?, ?, ?, 'Activo')
                 ON DUPLICATE KEY UPDATE id_rol = VALUES(id_rol), estado = 'Activo'`,
                [req.params.matricula, id_rol, id_semestre]
            );
        }

        res.json({ ok: true });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// DELETE /api/usuarios/:matricula
const deleteUsuario = async (req, res) => {
    try {
        const [result] = await db.query(
            `DELETE FROM usuario WHERE matricula = ?`,
            [req.params.matricula]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        res.json({ ok: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

module.exports = {
    getUsuarios,
    getPerfil,
    getPuntosTotales,
    getPuntosPorSemestre,
    getHistorial,
    getRoles,
    getMaterias,
    getEstatusActividades,
    getGeneracion,
    getRolActivo,
    getActividadesAGestionar,
    createUsuario,
    updateUsuario,
    deleteUsuario
};