const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "penny2005", // tu password
  database: "vertice_passport"
});

db.connect(error => {
  if (error) {
    console.error("⭑Error conexión:" + error.stack);
    return;
  }
  console.log("⚡︎ Conectado a MySQL");

});

module.exports = db;