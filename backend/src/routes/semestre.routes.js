const express = require('express');
const router = express.Router();
const controller = require('../controllers/semestre.controller');

/**
 * @swagger
 * tags:
 *   name: Semestre
 *   description: API para consultar semestres del programa
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Semestre:
 *       type: object
 *       properties:
 *         id_semestre:
 *           type: integer
 *         nombre_semestre:
 *           type: string
 *         inicio_fecha:
 *           type: string
 *           format: date
 *         fin_fecha:
 *           type: string
 *           format: date
 *         activo:
 *           type: boolean
 *       example:
 *         id_semestre: 9
 *         nombre_semestre: "Ene-Jun 2026 (26-2)"
 *         inicio_fecha: "2026-01-12"
 *         fin_fecha: "2026-05-15"
 *         activo: true
 */

/**
 * @swagger
 * /api/semestres:
 *   get:
 *     summary: Obtener todos los semestres
 *     tags: [Semestre]
 *     responses:
 *       200:
 *         description: Lista de todos los semestres ordenados por fecha
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Semestre'
 *       500:
 *         description: Error del servidor
 */
router.get('/', controller.getSemestres);

/**
 * @swagger
 * /api/semestres/activo:
 *   get:
 *     summary: Obtener el semestre actualmente activo
 *     tags: [Semestre]
 *     responses:
 *       200:
 *         description: Semestre activo
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Semestre'
 *       404:
 *         description: No hay semestre activo configurado
 *       500:
 *         description: Error del servidor
 */
router.get('/activo', controller.getSemestreActivo);

/**
 * @swagger
 * /api/semestres/activo/roles:
 *   get:
 *     summary: Obtener roles de todos los miembros en el semestre activo
 *     tags: [Semestre]
 *     responses:
 *       200:
 *         description: Lista de miembros con su rol, nivel y estado en el semestre activo
 *         content:
 *           application/json:
 *             example:
 *               - matricula: "00505198"
 *                 nombre_completo: "Leah Regina Zepeda Perez"
 *                 rol: "Miembro"
 *                 nivel: "Miembro"
 *                 nombre_semestre: "Ene-Jun 2026 (26-2)"
 *                 estado: "Activo"
 *       500:
 *         description: Error del servidor
 */
router.get('/activo/roles', controller.getRolesSemestreActivo);

module.exports = router;