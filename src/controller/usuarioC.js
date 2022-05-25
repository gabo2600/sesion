const model = require("../model/usuarioM");
const usuarioM = new model();
const controller = require("./controller");
const val = require('validator');


class usuarioC extends controller{
    constructor(){
        super();
    }

    primerUso(){
        return true;
    }

    crear(nom,pat,mat,user,pass,rpass){
        let err = [];
        //Validacion
        console.log(nom+pat+mat+user+pass+rpass);

        if (val.isEmpty(nom,{ignore_whitespace:false}) || val.isEmpty(pat,{ignore_whitespace:false}) || val.isEmpty(mat,{ignore_whitespace:false}) || val.isEmpty(user,{ignore_whitespace:false}) || val.isEmpty(pass,{ignore_whitespace:false}) )
            err.push("Todos los campos son obligatorios");

        if (!val.isAlpha(nom,['es-ES']) || !val.isAlpha(pat,'es-ES') || !val.isAlpha(mat,'es-ES') )
            err.push("Solo se permiten letras en los nombres y apellidos");

        if (!val.isLength(user,{min:3,max:20}))
            err.push("El nombre de usuario debe ser menor a 20 caracteres y mayor a 3 caracteres");

        if (!val.isLength(pass ,{min:4,max:undefined}))
            err.push("Las contraseñas no coinciden");

        if (!val.isAlphanumeric(nom,['es-ES']))
        err.push("El nombre de usuario debe estar conformado por caracteres alfanumericos");
        
        if (!val.equals(pass,rpass))
            err.push("Las contraseñas no coinciden");

        return err;
    }

    login(user,pass){
        let token = undefined;
        //Validacion
        console.log(user,pass);
        return token;
    }

}

module.exports = usuarioC;