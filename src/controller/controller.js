const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })
let aux = {
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASS,
    database: process.env.DB,
    port: process.env.DBPORT,
    waitForConnections: true,
    connectionLimit: 999,
    queueLimit: 0
  };

class controller{
    constructor(){
        this.secret = process.env.SALT;
        console.log(aux);
    }

    jwtEnc(param){//recibe un objeto, da un token(cadena)
        return jwt.sign(param, secret, { expiresIn: '72h'});
    }
    
    jwtDec(param){ //recibe un token,da un objeto con los datos
        try{
            return jwt.verify(param,secret);}
        catch(e){
            console.log("Error : "+e.message);
            return undefined;
        }
    }
}

module.exports = controller;