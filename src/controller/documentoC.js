const model = require("../model/model");
const docM = new model("documento");
const controller = require("./controller");

//Controlador que muestra los documentos asociados a cada sesion

class documentoC extends controller{
    constructor(){
        super();
    }


    verComites = async(hash)=>{ //retorna objeto con comites o un undefined
        let data = undefined;
        let comites = undefined;
        if (hash!= undefined)
        {
            data = this.jwtDec(hash);
            if (data!== undefined)
            {   
                return await com.findJoint({comite:'idComite',ruc:'idComite'},{idUsuario:data.idUsuario});
            }
                return undefined
        }
        else
            return undefined; 
    }

    ver = async(idComite,numSesion,tipo)=>{
        let res = undefined;//info del documento
        if (idComite!= undefined && numSesion!= undefined && tipo!= undefined)
        {
            res = await docM.findJoint({documento:'idSesion',sesion:''},{idComite:idComite,numSesion:numSesion,tipoDocumento:tipo},['documento.*','numSesion','idComite'])
        }    
        return res;
    }


}

const documentoO = new documentoC();

module.exports = documentoO;