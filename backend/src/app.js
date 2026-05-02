// Archivo principal de la aplicación Express
const express = require('express');
const cors = require('cors');

// Importar configuración de Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./docs/swagger');

const app = express();

app.use(cors());
app.use(express.json());

// Importar rutas
const actividadRoutes = require('./routes/actividad.routes');

// Usar rutas
app.use('/api', actividadRoutes);

// Swagger 
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Ruta base
app.get('/', (req, res) => {
    res.send('API funcionando');
});


// Exportar la aplicación para usarla en index.js
module.exports = app;