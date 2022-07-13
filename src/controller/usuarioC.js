const model = require("../model/model");
const usuarioM = new model("usuario");
const controller = require("./controller");
const val = require('validator');
const obsM = new model('observacion');
const rucM = new model('ruc');

class usuarioC extends controller {
    constructor() {
        super();
    }
    primerUso = async () => {
        let r = await usuarioM.existe({ tipoUsuario: 1 ,borrado:0});
        r = !r;
        return r;
    }

    crear = async (nom, pat, mat, user, pass, rpass, type) => {
        try {
            let err = [];
            //Validacion
            if (!!nom)
                nom = nom.replace(/\s+/g, ' ').trim();
            if (!!pat)
                pat = pat.replace(/\s+/g, ' ').trim();
            if (!!mat)
                mat = mat.replace(/\s+/g, ' ').trim();
            if (!!user)
                user = user.replace(/\s+/g, ' ').trim();

            if (val.isEmpty(nom, { ignore_whitespace: false }) || val.isEmpty(pat, { ignore_whitespace: false }) || val.isEmpty(mat, { ignore_whitespace: false }) || val.isEmpty(user, { ignore_whitespace: false }) || val.isEmpty(pass, { ignore_whitespace: false }))
                err.push("Todos los campos son obligatorios");

            if (!val.isAlpha(nom, ['es-ES'],{ignore:' '}) || !val.isAlpha(pat, 'es-ES',{ignore:' '}) || !val.isAlpha(mat, 'es-ES',{ignore:' '}))
                err.push("Solo se permiten letras y espacios en los nombres y apellidos");

            if (!val.isLength(user, { min: 3, max: 20 }))
                err.push("El nombre de usuario debe ser menor a 20 caracteres y mayor a 3 caracteres");

            if (!val.isLength(pass, { min: 4, max: undefined }))
                err.push("Las contraseña debe de ser mayor a 3 caracteres");

            if (!val.isAlphanumeric(user, ['es-ES']))
                err.push("El nombre de usuario debe estar conformado por caracteres alfanumericos");

            if (!val.equals(pass, rpass))
                err.push("Las contraseñas no coinciden");

            if (await usuarioM.existe({ user: user }))
                err.push("El nombre de usuario '" + user + "' ya esta registrado, ingrese uno distinto");

            if (err.length === 0){
                pass = this.encrypt(pass);
                await usuarioM.crear({ nombre: nom.replace(/\s/g , "-"), apellidoP: pat.replace(/\s/g , "-"), apellidoM: mat.replace(/\s/g , "-"), user: user, pass: pass, tipoUsuario: type });
            }
            return err;
        } catch (e) {
            return [e.message]
        }
    }

    login = async (user, pass) => {
        let token = undefined;
        let id = undefined;
        if (val.isEmpty(user, { ignore_whitespace: false }) || val.isEmpty(pass, { ignore_whitespace: false }))
            return undefined;
        let usr = await usuarioM.find({ user: user,borrado:0});

        if (usr != undefined) {
            for(let i = 0 ; i< usr.length ; i++)
                if (this.decrypt(usr[i].pass) == pass)
                    id = i;
            
            if (id!= undefined)
            {
                usr = usr[id];
                token = this.jwtEnc({
                    idUsuario: usr.idUsuario,
                    nombre: usr.nombre.replace(/-/g,' ') + " " + usr.apellidoP.replace(/-/g,' ') + " " + usr.apellidoM.replace(/-/g,' ')
                });
            }
        }
        return token;
    }

    editar = async (nom, pat, mat, user, pass, rpass, type, id) => {
        let err = [];
        //Validacion
        if (!!nom)
            nom = nom.replace(/\s+/g, ' ').trim();
        if (!!pat)
            pat = pat.replace(/\s+/g, ' ').trim();
        if (!!mat)
            mat = mat.replace(/\s+/g, ' ').trim();
        if (!!user)
            user = user.replace(/\s+/g, ' ').trim();

        if (val.isEmpty(nom, { ignore_whitespace: false }) || val.isEmpty(pat, { ignore_whitespace: false }) || val.isEmpty(mat, { ignore_whitespace: false }) || val.isEmpty(user, { ignore_whitespace: false }))
            err.push("Todos los campos son obligatorios referentes a datos personales");
 
        if (!val.isAlpha(nom, ['es-ES'],{ignore:' '}) || !val.isAlpha(pat, 'es-ES',{ignore:' '}) || !val.isAlpha(mat, 'es-ES',{ignore:' '}))
            err.push("Solo se permiten letras y espacios en los nombres y apellidos");

        if (!val.isLength(user, { min: 3, max: 20 }))
            err.push("El nombre de usuario debe ser menor a 20 caracteres y mayor a 3 caracteres");

        if (!val.isAlphanumeric(user, ['es-ES']))
            err.push("El nombre de usuario debe estar conformado por caracteres alfanumericos");

        if (!val.equals(pass, rpass))
            err.push("Las contraseñas no coinciden");

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
            if (err.length < 1)
                await usuarioM.editar({ nombre: nom.replace(/\s/g , "-"), apellidoP: pat.replace(/\s/g , "-"), apellidoM: mat.replace(/\s/g , "-"), user: user, pass: this.encrypt(pass), tipoUsuario: type }, { idUsuario: id,borrado:0 });
        }
        else { //sino
            console.log(err)
            if (err.length < 1) //se no modifica la contraseña
                await usuarioM.editar({ nombre: nom.replace(/\s/g , "-"), apellidoP: pat.replace(/\s/g , "-"), apellidoM: mat.replace(/\s/g , "-"), user: user, tipoUsuario: type }, { idUsuario: id ,borrado:0});
        }
        return err;
    }

    borrar = async (idUsuario) => {
        let err;

        if (await obsM.existe({ idUsuario: idUsuario }) || await rucM.existe({ idUsuario: idUsuario }))
            err = await usuarioM.borrarS({ idUsuario: idUsuario })
        else //De lo contrario se le desabilita para conservar la integridad de los datos
            err = await usuarioM.borrar({ idUsuario: idUsuario });
        return err;
    }

    ver = async (idUsuario = undefined,param=undefined,borrados = false) => {
        let user,i;
        if (idUsuario != undefined){
            
            user = await usuarioM.find({ idUsuario: idUsuario,borrado:Number(borrados)});
            if (user!= undefined){
                user = user[0];
                user.nombre = user.nombre.replace(/-/g,' ');
                user.apellidoP = user.apellidoP.replace(/-/g,' ');
                user.apellidoM = user.apellidoM.replace(/-/g,' ');
            }    
        }else{
            user = await usuarioM.search(["nombre","apellidoP","apellidoM","user"],param,{borrado:Number(borrados)});

            if (user != undefined)
                for(i = 0 ; i<user.length ; i++){
                    user[i].nombre = user[i].nombre.replace(/-/g,' ');
                    user[i].apellidoP = user[i].apellidoP.replace(/-/g,' ');
                    user[i].apellidoM = user[i].apellidoM.replace(/-/g,' ');
                }
        }
        return user;
    }

    restaurar = async (idUsuario) => {
        //Modelos de observaciones,y sesiones para dependiendo de la actividad del usuario este sea borrado o desabilitado
        let err = undefined;
        if (idUsuario !== undefined)
        {
            idUsuario = parseInt(idUsuario);
            err = await usuarioM.restaurarS({ idUsuario: idUsuario })
        }
        return err;
    }

}
const usuarioO = new usuarioC();

module.exports = usuarioO;