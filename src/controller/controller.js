const jwt = require('jsonwebtoken');
const model = require("../model/model");
const val = require('validator');
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
        
        let isAdmin = false;
        let data = undefined;
        if (hash != undefined && typeof hash === "string")
        if (val.isJWT(hash)){
            data = this.jwtDec(hash);
            let usr = new model("usuario");
            if (await usr.existe({idUsuario: data.idUsuario,tipoUsuario:1}))
                isAdmin = true;
        }
        return [isAdmin,data];
    }
}

module.exports = controller;