const express = require('express');
const router = express.Router();
const controller = require('../controllers/usuario.controller');

/**
 * @swagger
 * tags:
 *   name: Usuario
 *   description: API para gestionar usuarios
 */

/**
 * @swagger
 * /api/usuarios:
 *   get:
 *     summary: Obtener todos los usuarios
 *     tags: [Usuario]
 *     responses:
 *       200:
 *         description: Lista de usuarios
 */
router.get('/usuarios', controller.getUsuarios);

/**
 * @swagger
 * /api/usuarios/{matricula}/perfil:
 *   get:
 *     summary: Obtener perfil de un usuario
 *     tags: [Usuario]
 *     parameters:
 *       - name: matricula
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Perfil del usuario
 *       404:
 *         description: Usuario no encontrado
 */
router.get('/usuarios/:matricula/perfil', controller.getPerfil);

/**
 * @swagger
 * /api/usuarios/{matricula}/puntos:
 *   get:
 *     summary: Obtener puntos totales acumulados de un usuario
 *     tags: [Usuario]
 *     parameters:
 *       - name: matricula
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Puntos acumulados
 */
router.get('/usuarios/:matricula/puntos', controller.getPuntosTotales);

/**
 * @swagger
 * /api/usuarios/{matricula}/puntos/{id_semestre}:
 *   get:
 *     summary: Obtener puntos de un usuario en un semestre específico
 *     tags: [Usuario]
 *     parameters:
 *       - name: matricula
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: id_semestre
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Puntos del semestre
 */
router.get('/usuarios/:matricula/puntos/:id_semestre', controller.getPuntosPorSemestre);

/**
 * @swagger
 * /api/usuarios/{matricula}/historial:
 *   get:
 *     summary: Obtener historial de asistencias de un usuario
 *     tags: [Usuario]
 *     parameters:
 *       - name: matricula
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Historial de asistencias
 */
router.get('/usuarios/:matricula/historial', controller.getHistorial);

/**
 * @swagger
 * /api/usuarios/{matricula}/roles:
 *   get:
 *     summary: Obtener roles por semestre de un usuario
 *     tags: [Usuario]
 *     parameters:
 *       - name: matricula
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Roles del usuario
 */
router.get('/usuarios/:matricula/roles', controller.getRoles);

/**
 * @swagger
 * /api/usuarios/{matricula}/materias:
 *   get:
 *     summary: Obtener materias de un usuario
 *     tags: [Usuario]
 *     parameters:
 *       - name: matricula
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Materias del usuario
 */
router.get('/usuarios/:matricula/materias', controller.getMaterias);

/**
 * @swagger
 * /api/usuarios/{matricula}/estatus-actividades:
 *   get:
 *     summary: Obtener estatus de actividades de un usuario
 *     tags: [Usuario]
 *     parameters:
 *       - name: matricula
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Estatus de actividades
 */
router.get('/usuarios/:matricula/estatus-actividades', controller.getEstatusActividades);

/**
 * @swagger
 * /api/usuarios/{matricula}/generacion:
 *   get:
 *     summary: Obtener generación de un usuario
 *     tags: [Usuario]
 *     parameters:
 *       - name: matricula
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Generación del usuario
 */
router.get('/usuarios/:matricula/generacion', controller.getGeneracion);

/**
 * @swagger
 * /api/usuarios/{matricula}/rol-activo:
 *   get:
 *     summary: Obtener el rol del usuario en el semestre activo
 *     tags: [Usuario]
 *     parameters:
 *       - name: matricula
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: >
 *           Rol activo del usuario. Si es Miembro o no tiene rol,
 *           devuelve esAdmin = false
 *         content:
 *           application/json:
 *             examples:
 *               admin:
 *                 value: { esAdmin: true, rol: "Beca laboral", nivel: "Coordinacion", id_rol: 2 }
 *               miembro:
 *                 value: { esAdmin: false, rol: null }
 */
router.get('/usuarios/:matricula/rol-activo', controller.getRolActivo);

/**
 * @swagger
 * /api/usuarios/{matricula}/actividades-a-gestionar:
 *   get:
 *     summary: Obtener actividades del semestre activo que puede gestionar el usuario
 *     tags: [Usuario]
 *     parameters:
 *       - name: matricula
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Lista de actividades a gestionar
 *       403:
 *         description: Sin permisos de gestión
 */
router.get('/usuarios/:matricula/actividades-a-gestionar', controller.getActividadesAGestionar);
router.post('/usuarios', controller.createUsuario);
router.put('/usuarios/:matricula', controller.updateUsuario);
router.delete('/usuarios/:matricula', controller.deleteUsuario);


module.exports = router;