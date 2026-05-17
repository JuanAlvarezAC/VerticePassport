const express = require('express');
const router = express.Router();

const controller = require('../controllers/carrera.controller');

router.get('/carreras', controller.getCarreras);

module.exports = router;