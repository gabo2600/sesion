const mysql = require('mysql2');
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })




// Create the connection pool. The pool-specific settings are the defaults
const pool = mysql.createPool({
  host: process.env.DBHOST,
  user: process.env.DBUSER,
  password: process.env.DBPASS,
  database: process.env.DB,
  port: process.env.DBPORT,
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