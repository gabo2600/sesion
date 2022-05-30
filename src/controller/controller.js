const jwt = require('jsonwebtoken');
const model = require("../model/model");
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })

class controller{
    constructor(){
        this.secret = process.env.SALT;
    }

    jwtEnc(param){//recibe un objeto, da un token(cadena)
        return jwt.sign(param, this.secret, { expiresIn: '72h'});
    }
    
    jwtDec(param){ //recibe un token,da un objeto con los datos
        try{
            return jwt.verify(param,this.secret);}
        catch(e){
            console.log("Error : "+e.message);
            return undefined;
        }
    }

    adminCheck = async(hash)=>{
        try{
            let val = false;
            hash = this.jwtDec(hash);
            let usr = new model("usuario");

            if (await usr.existe({idUsuario: hash.idUsuario})){
                val = true;
            }
            return [val,hash];
        }catch(e){
            console.log("adminCheck:" +e.message);
            return false;
        }
    }
}

module.exports = controller;