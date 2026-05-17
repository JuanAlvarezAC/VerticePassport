const mysql = require("mysql2/promise");

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "penny2005",
  database: "vertice_passport"
});

console.log("⚡︎ Conectado a MySQL");

module.exports = db;