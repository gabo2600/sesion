const model = require("../model/model");
const usuarioM = new model("usuario");
const controller = require("./controller");
const val = require('validator');


class usuarioC extends controller{
    constructor(){
        super();
    }

    primerUso = async()=>{
        return await usuarioM.existe({tipoUsuario:1});
    }

    crear(nom,pat,mat,user,pass,rpass,type){
        let err = [];
        //Validacion
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
        if (err.length>0) 
           usuarioM.crear({nombre:nom,apellidoP:pat,apellidoM:mat,user:user,pass:pass,tipoUsuario:1,tipoUsuario:type});
        return err;
    }

    login = async(user,pass)=>{
        let token = undefined;
        if (val.isEmpty(user,{ignore_whitespace:false}) || val.isEmpty(pass,{ignore_whitespace:false}) )
            err.push("Todos los campos son obligatorios");
        let usr = await usuarioM.find({user:user,pass:pass});
        
        if (usr!= undefined){
            token = this.jwtEnc({
                idUsuario: usr.idUsuario
            });
        }
        return token;
    }

}

module.exports = usuarioC;