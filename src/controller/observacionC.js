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

        if (hash!= undefined)
        {
            //Se checa si el usuario es miembro del comite
            tmp = obs.findCustom("SELECT * FROM ruc WHERE idUsuario="+hash.idUsuario+" AND idComite="+data.idComite);
            if (tmp!=undefined)
                res=true;
        }
        return res;
    }

    crear = async(txt,data)=>{
        let res = undefined; //Respuesta de la transaccion
        let idDoc = undefined; //Id del documento

        if (txt!='' || txt=== undefined)
        {
            
        }
        else
            res = "Mensaje vacio";

        return res;
    }

}

const observacionO = new observacionC();
module.exports = observacionO;