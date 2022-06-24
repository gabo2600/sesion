const model = require("../model/model");
const obs = new model("observacion");
const doc = new model("documento");

const controller = require("./controller");


class observacionC extends controller{
    constructor(){
        super();
    }

    auth = async(hash,data)=>{
        hash = this.jwtDec(hash);
        let res = false; //Respuesta de la funcion
        let tmp = undefined;//Variable que guarda los datos de la consulta

        if (hash!= undefined && data!= undefined)
        {
            //Se checa si el usuario es miembro del comite
            tmp = obs.findCustom("SELECT * FROM ruc WHERE idUsuario="+hash.idUsuario+" AND idComite="+data.com);
            if (tmp!=undefined)
                res=true;
        }
        return res;
    }

    crear = async(txt,data,hash)=>{
        var res = undefined; //Respuesta de la transaccion
        var idDoc = undefined; //Id del documento
        var idUsr = undefined;

        idUsr = this.jwtDec(hash);

        if (txt!='' || txt!== undefined)
        {
            if (idUsr!= undefined){
                idUsr = idUsr.idUsuario;
                
                idDoc = await doc.findJoint({documento:'idSesion',sesion:''},{idComite:data.com,numSesion:data.ses,tipoDocumento:data.tipo},['documento.idDocumento']);
                idDoc = idDoc[0].idDocumento;

                obs.crear({observacion:txt,idUsuario:idUsr,idDocumento:idDoc},false);
            }
            else{
                res = "La sesion ha expirado";
            }
        }
        else
            res = "Mensaje vacio";
        return res;
    }
}

const observacionO = new observacionC();
module.exports = observacionO;