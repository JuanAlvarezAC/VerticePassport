const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./docs/swagger');

const app = express();

app.use(cors());
app.use(express.json());

// ── Rutas ─────────────────────────────────────────────────────
const actividadRoutes = require('./routes/actividad.routes');
const authRoutes = require('./routes/auth.routes');
const usuarioRoutes = require('./routes/usuario.routes');
const asistenciaRoutes = require('./routes/asistencia.routes');
const semestreRoutes = require('./routes/semestre.routes');
const tipoActividadRoutes = require('./routes/tipoActividad.routes');
const carreraRoutes = require('./routes/carrera.routes');
const rolRoutes = require('./routes/rol.routes');
// Las rutas que ya tienen el path completo dentro del router van con /api
app.use('/api', actividadRoutes);   // /api/actividad/...
app.use('/api', authRoutes);        // /api/login
app.use('/api', usuarioRoutes);     // /api/usuarios/...
app.use('/api', tipoActividadRoutes); // /api/tipos-actividad/...
app.use('/api', carreraRoutes);      // /api/carreras/...
app.use('/api', rolRoutes);          // /api/roles/...
// Las rutas que solo tienen / y /:params dentro del router necesitan su prefijo
app.use('/api/asistencias', asistenciaRoutes);  // /api/asistencias/...
app.use('/api/semestres', semestreRoutes);       // /api/semestres/...
app.use('/api/roles', rolRoutes);                // /api/roles/...
// ── Swagger ───────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ── Ruta base ─────────────────────────────────────────────────
app.get('/', (req, res) => {
    res.send('API funcionando ✅');
});

module.exports = app;