const express = require('express');
const router = express.Router();

const controller = require('../controllers/tipoActividad.controller');

router.get('/tipos-actividad', controller.getTiposActividad);

module.exports = router;