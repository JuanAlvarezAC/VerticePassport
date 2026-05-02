// Importar el archivo app.js que contiene la configuración de Express
const app = require('./app');

const port = 3000;

app.listen(port, () => {  //Se usa el metodo listen para iniciar el servidor en el puerto especificado
    console.log("⚡︎ Servidor escuchando en el puerto " + port)
})