const mysql = require('mysql2');
require('dotenv').config();




// Create the connection pool. The pool-specific settings are the defaults
const pool = mysql.createPool({
  /*host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASS,
  database: process.env.DB,
  port: process.env.PORT,*/
  host: 'localhost',
  user: 'gabo',
  password: '1312123',
  database: 'sesion',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 999,
  queueLimit: 0
});


const query = async function(sql,param= undefined){
  try{
  if (param!=undefined)
    return await pool.promise().query(sql,param);
      else
    return await pool.promise().query(sql);
  }catch(e){
    return e;
  }
}

module.exports = query;