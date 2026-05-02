// Importar swagger y configurar opciones
const swaggerJsDoc = require('swagger-jsdoc');

// Configuración de Swagger
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Backend de Vertice Passport',
            version: '1.0.0',
        },
    },
    apis: ['./src/routes/*.js'], // Ruta a los archivos donde se encuentran las anotaciones de Swagger
};
// Generar documentación Swagger
module.exports = swaggerJsDoc(options);