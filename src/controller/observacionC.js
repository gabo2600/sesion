const model = require("../model/model");
const obs = new model("observacion");
const doc = new model("documento");

const controller = require("./controller");


class observacionC extends controller {
    constructor() {
        super();
    }

    auth = async (hash, data) => {
        hash = this.jwtDec(hash);
        let res = false; //Respuesta de la funcion
        let tmp = undefined;//Variable que guarda los datos de la consulta

        if (hash != undefined && data != undefined) {
            //Se checa si el usuario es miembro del comite
            tmp = obs.findCustom("SELECT * FROM ruc WHERE idUsuario=" + hash.idUsuario + " AND idComite=" + data.com);
            if (tmp != undefined)
                res = true;
        }
        return res;
    }

    crear = async (txt, data, hash) => {
        var res = undefined; //Respuesta de la transaccion
        var idDoc = undefined; //Id del documento
        var idUsr = undefined;

        idUsr = this.jwtDec(hash);

        if (txt != '' && txt !== undefined) {
            if (idUsr != undefined) {
                idUsr = idUsr.idUsuario;

                idDoc = await doc.findJoint({ documento: 'idSesion', sesion: '' }, { idComite: data.com, numSesion: data.ses, tipoDocumento: data.tipo, 'sesion.borrado':0 }, ['documento.idDocumento']);
                if (!!idDoc){
                    idDoc = idDoc[0].idDocumento;
                    obs.crear({ observacion: txt, idUsuario: idUsr, idDocumento: idDoc }, false);
                    res = "Ok"
                }else
                    res = "Sesion archivada";
            }
            else {
                res = "La sesion ha expirado";
            }
        }
        else
            res = "Mensaje vacio";
        return res;
    }

    index = async (com, ses, tipo, hash) => {
        var res = undefined; //Respuesta de la transaccion
        var observaciones = undefined;
        var idDoc = undefined; //Id del documento
        var idUsr = undefined; //id del usuario

        if (await this.auth(hash,{com:com})){ //Si el usuario es parte del comite del archivo
            idUsr = this.jwtDec(hash);
            if (idUsr != undefined) {
                idUsr = idUsr.idUsuario;
                
                idDoc = await doc.findJoint({ documento: 'idSesion', sesion: '' }, { idComite:com, numSesion: ses, tipoDocumento: tipo, 'sesion.borrado':0 }, ['documento.idDocumento']);
                if (idDoc!= undefined)
                {
                    idDoc = idDoc[0].idDocumento;
                    observaciones = await obs.findJoint({observacion:'idUsuario',usuario:''},{idDocumento:idDoc},['observacion.*',"nombre","apellidoP","apellidoM"]);
                }
            }
        }
        res = {obs:observaciones,idUsr:idUsr};
        return res;
    }

    borrar = async (idObs,idUsuario)=>{
        let prove = undefined; //Varaible que guarda el resultado de la query de buscar la obsertvacion y el usuario
        let res = undefined; //Resultado de toda la operación;
        let resMsg = undefined; //Mensaje a retornar

        if (idObs!= undefined && idUsuario!= undefined){
            prove = await obs.find({idUsuario:idUsuario,idObservacion:idObs},false,['idUsuario,idObservacion']);
            if (prove!= undefined) //Si el usuario es el autor de la observación
            {
                prove = prove[0];
                res = await obs.borrar({idUsuario:prove.idUsuario,idObservacion: prove.idObservacion}); 
                if (res)
                    resMsg = "Ok";
                else
                    resMsg = "Error 500 A ocurrido un error interno en el servidor";
            }
            else
                resMsg = "Error 403 no tiene permiso para realizar esta acción";
        }
        else
            resMsg = "Error 400 Datos invalidos";
        return resMsg;
    }

    editar = async (idObs,txt,idUsuario)=>{
        let prove = undefined; //Varaible que guarda el resultado de la query de buscar la obsertvacion y el usuario
        let res = undefined; //Resultado de toda la operación;
        let resMsg = undefined; //Mensaje a retornar
        if (idObs!= undefined && idUsuario!= undefined){
            prove = await obs.find({idUsuario:idUsuario,idObservacion:idObs},false,['idObservacion']);
            if (!!prove) //Si el usuario es el autor de la observación
            {
                prove = prove[0];
                res = await obs.editar({observacion:txt},{idObservacion: prove.idObservacion });
                if (res)
                    resMsg = "Ok";
                else
                    resMsg = "Error 500 A ocurrido un error interno en el servidor";
            }
            else
                resMsg = "Error 403 no tiene permiso para realizar esta acción";
        }
        else
            resMsg = "Error 400 Datos invalidos";
        return resMsg;
    }
}

const observacionO = new observacionC();
module.exports = observacionO;