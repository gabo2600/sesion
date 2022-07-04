const mysql = require('mysql2');
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

// Crea una pool de 999 conecciones
class Con{
  instancia = undefined;
  pool = undefined;
  query = undefined;

  constructor(){
    if (!!Con.instancia){
      return Con.instancia;
    }
    
    Con.instancia = this;

    this.pool = mysql.createPool({
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
  
    this.query = async function(sql){
      try{
        return await this.pool.promise().query(sql);
      }catch(e){
        return e;
      }
    }
  }
}

module.exports = Con;
