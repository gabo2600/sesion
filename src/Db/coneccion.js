const mysql = require('mysql2');
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

// Crea una pool de 999 conecciones
const pool = mysql.createPool({
  host: process.env.DBHOST,
  user: process.env.DBUSER,
  password: process.env.DBPASS,
  database: process.env.DB,
  port: process.env.DBPORT,
  waitForConnections: true,
  connectionLimit: 999,
  dateStrings:true,
  queueLimit: 0
});

const query = async function(sql){
  try{
    return await pool.promise().query(sql);
  }catch(e){
    return e;
  }
}

module.exports = query;