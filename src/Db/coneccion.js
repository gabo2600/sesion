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
  queueLimit: 0
});
/*
my.createPool({
  host:'localhost',
  user:'gabo',
  password:'1312123',
  database:'sesion',
  port:3306,
  waitForConnections:true,
  connectionLimit:99,
  queueLimit:0

  host:'localhost',
  user:'gabo',
  password:'1312123',
  database:'sesion',
  port:3306,

  });
*/

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