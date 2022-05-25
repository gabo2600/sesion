const mysql = require('mysql2');
require('dotenv').config();




// Create the connection pool. The pool-specific settings are the defaults
const pool = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASS,
  database: process.env.DB,
  port: process.env.PORT,
  waitForConnections: true,
  connectionLimit: 999,
  queueLimit: 0
});

const query = async function(sql,param= undefined){
  if (param!=undefined)
    return await pool.promise().query(sql,param);
  else
  return await pool.promise().query(sql);
}

module.exports = query;