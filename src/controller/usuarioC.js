const model = require("../model/model");
const usuarioM = new model("usuario");
const controller = require("./controller");
const val = require('validator');
const async = require("hbs/lib/async");


class usuarioC extends controller {
    constructor() {
        super();
    }

    primerUso = async () => {
        let r = await usuarioM.existe({ tipoUsuario: 1 });
        r = r[0];
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
            token = this.jwtEnc({
                idUsuario: usr.idUsuario,
                nombre: usr.nombre + " " + usr.apellidoP + " " + usr.apellidoM
            });
        }
        return token;
    }

    editar = async (hash, nom, pat, mat, user, pass, rpass, type, id) => {
        let err = [];
        let isAdmin = await this.adminCheck(hash);
        isAdmin = isAdmin[0];

        //Validacion
        if (isAdmin) {
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
                if (ursAux.idUsuario != id)
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
        }
        else
            err.push('Solo un administrador puede crear usuarios');
        return err;
    }

    borrar = async (hash, idUsuario) => {
        //Modelos de observaciones,y sesiones para dependiendo de la actividad del usuario este sea borrado o desabilitado
        let obsM = new model('observacion'), sesM = new model('sesion');
        let err = '';
        hash = await this.adminCheck(hash) //decifra cookie y verifica si el usuario es admin
        let isAdmin = hash[0];
        
        hash = hash[1];
        if (isAdmin) {
            //verifica que el admin no se borre a si mismo
            if (hash.idUsuario === idUsuario)
                err="Error 403-Un administrador no puede borrarse a si mismo";
            else
                //Si el usuario a borrar no ha realizado ni sesiones ni observaciones en un documento se elimina
                if (await obsM.existe({ idUsuario: idUsuario }) || await sesM.existe({ idUsuario: idUsuario }))
                    await usuarioM.borrarS({ idUsuario: idUsuario })
                else //De lo contrario se le desabilita para conservar la integridad de los datos
                    await usuarioM.borrar({ idUsuario: idUsuario });
        } else  //El usuario no es admin y se le manda a la goma  
            err="Error 403-Solo un administrador puede realizar esta operaciòn";
        return err;
    }

    index = async (hash) => {
        hash = await this.adminCheck(hash) //decifra cookie y verifica si el usuario es admin
        let isAdmin = hash[0];
        hash = hash[1];
        let users = [];
        if (isAdmin) {
            users = await usuarioM.find();
        }
        return users;
    }

    ver = async (hash, idUsuario) => {
        hash = await this.adminCheck(hash) //decifra cookie y verifica si el usuario es admin
        let isAdmin = hash[0];
        hash = hash[1];
        let user = [];
        if (isAdmin) {
            user = await usuarioM.find({ idUsuario });
        }
        return user;
    }
}

module.exports = usuarioC;