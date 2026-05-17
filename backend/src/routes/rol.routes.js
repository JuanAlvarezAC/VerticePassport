const express = require('express');
const router = express.Router();
const { getRoles } = require('../controllers/rol.controller');

router.get('/', getRoles);

module.exports = router;