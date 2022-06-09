const model = require("../model/model");
const usuarioM = new model("usuario");
const controller = require("./controller");
const val = require('validator');

class usuarioC extends controller {
    constructor() {
        super();
    }

    primerUso = async () => {
        let r = await usuarioM.existe({ tipoUsuario: 1 });
        r = !r;
        return r;
    }
    crear = async (nom, pat, mat, user, pass, rpass, type) => {
        try {
            let err = [];
            //Validacion
            if (val.isEmpty(nom, { ignore_whitespace: false }) || val.isEmpty(pat, { ignore_whitespace: false }) || val.isEmpty(mat, { ignore_whitespace: false }) || val.isEmpty(user, { ignore_whitespace: false }) || val.isEmpty(pass, { ignore_whitespace: false }))
                err.push("Todos los campos son obligatorios");

            if (!val.isAlpha(nom, ['es-ES']) || !val.isAlpha(pat, 'es-ES') || !val.isAlpha(mat, 'es-ES'))
                err.push("Solo se permiten letras en los nombres y apellidos");

            if (!val.isLength(user, { min: 3, max: 20 }))
                err.push("El nombre de usuario debe ser menor a 20 caracteres y mayor a 3 caracteres");

            if (!val.isLength(pass, { min: 4, max: undefined }))
                err.push("Las contraseña debe de ser mayor a 3 caracteres");

            if (!val.isAlphanumeric(nom, ['es-ES']))
                err.push("El nombre de usuario debe estar conformado por caracteres alfanumericos");

            if (!val.equals(pass, rpass))
                err.push("Las contraseñas no coinciden");

            if (await usuarioM.existe({ user: user }))
                err.push("El nombre de usuario '" + user + "' ya esta registrado, ingrese uno distinto");

            if (err.length === 0)
                await usuarioM.crear({ nombre: nom, apellidoP: pat, apellidoM: mat, user: user, pass: pass, tipoUsuario: type });
            return err;
        } catch (e) {
            return [e.message]
        }
    }

    login = async (user, pass) => {
        let token = undefined;
        console.log(this.secret);
        if (val.isEmpty(user, { ignore_whitespace: false }) || val.isEmpty(pass, { ignore_whitespace: false }))
            err.push("Todos los campos son obligatorios");
        let usr = await usuarioM.find({ user: user, pass: pass });

        if (usr != undefined) {
            usr = usr[0];
            token = this.jwtEnc({
                idUsuario: usr.idUsuario,
                nombre: usr.nombre + " " + usr.apellidoP + " " + usr.apellidoM
            });
        }
        return token;
    }

    editar = async (nom, pat, mat, user, pass, rpass, type, id) => {
        let err = [];
        //Validacion
        if (val.isEmpty(nom, { ignore_whitespace: false }) || val.isEmpty(pat, { ignore_whitespace: false }) || val.isEmpty(mat, { ignore_whitespace: false }) || val.isEmpty(user, { ignore_whitespace: false }))
            err.push("Todos los campos son obligatorios");

        if (!val.isAlpha(nom, ['es-ES']) || !val.isAlpha(pat, 'es-ES') || !val.isAlpha(mat, 'es-ES'))
            err.push("Solo se permiten letras en los nombres y apellidos");

        if (!val.isLength(user, { min: 3, max: 20 }))
            err.push("El nombre de usuario debe ser menor a 20 caracteres y mayor a 3 caracteres");

        if (!val.isAlphanumeric(nom, ['es-ES']))
            err.push("El nombre de usuario debe estar conformado por caracteres alfanumericos");

        //checa que el usuario no se repita en la tabla y tambien que no este contando su propio nombre de usuario
        let ursAux = await usuarioM.find({ user: user });
        if (ursAux != undefined)
            if (ursAux[0].idUsuario != id)
                err.push("El nombre de usuario '" + user + "' ya esta registrado, ingrese uno distinto");

        if (pass !== '') { //Checa si el campo de contraseña esta vacio,
            if (!val.isLength(pass, { min: 4, max: undefined }))
                err.push("Las contraseña debe de ser mayor a 3 caracteres");
            if (!val.equals(pass, rpass)) //Si no lo esta valida y cambia la contraseña
                err.push("Las contraseñas no coinciden");
            console.log([pass]);
            if (err.length < 1)
                console.log("Edit2 : " + await usuarioM.editar({ nombre: nom, apellidoP: pat, apellidoM: mat, user: user, pass: pass, tipoUsuario: type }, { idUsuario: id }));
        }
        else { //sino
            console.log(err)

            if (err.length < 1) //se no modifica la contraseña
                console.log("Edit 1: " + await usuarioM.editar({ nombre: nom, apellidoP: pat, apellidoM: mat, user: user, tipoUsuario: type }, { idUsuario: id }));
        }
        return err;
    }

    borrar = async (idUsuario) => {
        //Modelos de observaciones,y sesiones para dependiendo de la actividad del usuario este sea borrado o desabilitado
        let obsM = new model('observacion'), sesM = new model('sesion');
        let err;

        if (await obsM.existe({ idUsuario: idUsuario }) || await sesM.existe({ idUsuario: idUsuario }))
            err = await usuarioM.borrarS({ idUsuario: idUsuario })
        else //De lo contrario se le desabilita para conservar la integridad de los datos
            err = await usuarioM.borrar({ idUsuario: idUsuario });
        return err;
    }

    ver = async (idUsuario = undefined) => {
        let user;
        if (idUsuario != undefined){
            user = await usuarioM.find({ idUsuario: idUsuario });
            if (user!= undefined)
                user = user[0];
        }else
            user = await usuarioM.find();
        return user;
    }


}

module.exports = usuarioC;