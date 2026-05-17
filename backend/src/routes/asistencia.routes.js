const express = require('express');
const router = express.Router();
const controller = require('../controllers/asistencia.controller');

/**
 * @swagger
 * tags:
 *   name: Asistencia
 *   description: API para registrar y consultar asistencias
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     AsistenciaInput:
 *       type: object
 *       required:
 *         - matricula
 *         - id_actividad
 *         - asistio
 *       properties:
 *         matricula:
 *           type: string
 *         id_actividad:
 *           type: integer
 *         asistio:
 *           type: boolean
 *       example:
 *         matricula: "00505198"
 *         id_actividad: 1
 *         asistio: true
 */

/**
 * @swagger
 * /api/asistencias:
 *   post:
 *     summary: Registrar o actualizar asistencia de un usuario a una actividad
 *     tags: [Asistencia]
 *     description: Hace upsert automático. Si el registro ya existe lo actualiza; si no, lo crea. Los puntos se asignan automáticamente por trigger según el tipo de actividad.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AsistenciaInput'
 *     responses:
 *       200:
 *         description: Asistencia guardada correctamente
 *         content:
 *           application/json:
 *             example:
 *               ok: true
 *               mensaje: "Asistencia guardada correctamente"
 *       400:
 *         description: Faltan campos requeridos
 *       500:
 *         description: Error del servidor
 */
router.post('/', controller.guardarAsistencia);

/**
 * @swagger
 * /api/asistencias/{matricula}/{id_actividad}/estatus:
 *   get:
 *     summary: Verificar si un usuario asistió a una actividad
 *     tags: [Asistencia]
 *     parameters:
 *       - name: matricula
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           example: "00505198"
 *       - name: id_actividad
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Estatus de asistencia
 *         content:
 *           application/json:
 *             example:
 *               estatus: "Asistió"
 *         description: Posibles valores - "Asistió", "No asistió", "Sin registro"
 *       500:
 *         description: Error del servidor
 */
router.get('/:matricula/:id_actividad/estatus', controller.getEstatusAsistencia);

module.exports = router;