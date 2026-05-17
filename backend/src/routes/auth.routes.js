// Ayuda a manejar las rutas relacionadas con la autenticación, como el inicio de sesión.
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

/**
 * @swagger
 * tags:
 *   name: Autenticación
 *   description: API para gestionar la autenticación de usuarios
 */
router.post('/login', authController.login);

module.exports = router;