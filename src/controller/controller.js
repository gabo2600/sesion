const jwt = require('jsonwebtoken');
const model = require("../model/model");
const val = require('validator');
var CryptoJS = require("crypto-js");
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') })


class controller{
    constructor(){
        this.secret = process.env.SALT;
    }

    encrypt  = (text)=> CryptoJS.AES.encrypt(text, this.secret).toString();
    
    decrypt = (hash)=>{
        let bytes  = CryptoJS.AES.decrypt(hash, this.secret);
        return bytes.toString(CryptoJS.enc.Utf8);
    }

    jwtEnc(param){//recibe un objeto, da un token(cadena)
        param = jwt.sign(param, this.secret, { expiresIn: '72h'});
        return this.encrypt(param);
    }

    jwtDec(param){ //recibe un token,da un objeto con los datos
        try{
            param = this.decrypt(param);
            param = jwt.verify(param,this.secret);
            return param;
        }
        catch(e){
            console.log("Controller.jwtDec Error : "+e);
            return undefined;
        }
    }
    adminCheck = async( hash=undefined )=>{
        let isAdmin = false;
        let data = undefined;
        let usr = undefined;

        if (hash != undefined && typeof hash === "string"){
            data = this.jwtDec(hash);
            if (data!= undefined){
                usr = new model("usuario");
                if (await usr.existe({idUsuario: data.idUsuario,tipoUsuario:1}))
                    isAdmin = true;
            }
        }
        return [isAdmin,data];
    }
}

module.exports = controller;