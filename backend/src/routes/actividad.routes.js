// Importar Express y el controlador
const express = require('express');
const router = express.Router();
const controller = require('../controllers/actividad.controller');

/**
 * @swagger
 * tags:
 *   name: Actividad
 *   description: API para gestionar actividades
 */
/**
 * @swagger
 * /api/actividad:
 *   get:
 *     summary: Obtener todas las actividades
 *     tags: [Actividad]
 *     responses:
 *       200:
 *         description: Lista de actividades
 *       500:
 *         description: Error del servidor
 */
router.get('/actividad', controller.getAll);
/**
 * @swagger
 * components:
 *  schemas:
 *    Actividad:
 *      type: object
 *      required:
 *        - nombre_act
 *        - id_tipo
 *        - id_semestre
 *        - id_rol_organizador
 *        - fecha
 *        - hora_inicio
 *        - hora_fin
 *        - lugar
 *      properties:
 *        nombre_act:
 *          type: string
 *        id_tipo:
 *          type: integer
 *        id_semestre:
 *          type: integer
 *        id_rol_organizador:
 *          type: integer
 *        fecha:
 *          type: string
 *          format: date
 *        hora_inicio:
 *          type: string
 *        hora_fin:
 *          type: string
 *        cupo_max:
 *          type: integer
 *        lugar:
 *          type: string
 *        descripcion:
 *          type: string
 *      example:
 *        nombre_act: "Prueba actividad"
 *        id_tipo: 2
 *        id_semestre: 9
 *        id_rol_organizador: 2
 *        fecha: "2026-08-28"
 *        hora_inicio: "17:00:00"
 *        hora_fin: "19:00:00"
 *        cupo_max: 50
 *        lugar: "Salón 101"
 *        descripcion: "Descripción de prueba"
 */


/**
 * @swagger
 * /api/actividad/{id}:
 *   get:
 *     summary: Obtener una actividad por ID
 *     tags: [Actividad]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Actividad encontrada
 *       404:
 *         description: No encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/actividad/:id', controller.getById);

/**
 * @swagger
 * /api/actividad:
 *   post:
 *     summary: Crear una nueva actividad
 *     tags: [Actividad]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Actividad'
 *     responses:
 *       201:
 *         description: Actividad creada correctamente
 *       400:
 *         description: Datos inválidos
 *       500:
 *         description: Error del servidor
 */
router.post('/actividad', controller.create);

/**
 * @swagger
 * /api/actividad/{id}:
 *   put:
 *     summary: Actualizar una actividad
 *     tags: [Actividad]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Actividad'
 *     responses:
 *       200:
 *         description: Actividad actualizada
 *       404:
 *         description: No encontrada
 *       500:
 *         description: Error del servidor
 */
router.put('/actividad/:id', controller.update);

/**
 * @swagger
 * /api/actividad/{id}:
 *   delete:
 *     summary: Eliminar una actividad
 *     tags: [Actividad]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Actividad eliminada
 *       404:
 *         description: No encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/actividad/:id', controller.remove);

module.exports = router;