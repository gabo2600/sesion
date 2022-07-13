const model = require("../model/model");
const docM = new model("documento");
const usrM = new model("usuario");
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
                comites = await com.findJoint({comite:'idComite',ruc:'idComite'},{idUsuario:data.idUsuario,'comite.borrado':0});
            }
        }
        return comites; 
    }

    ver = async(idComite,numSesion,tipo)=>{
        let res = undefined;//info del documento
        if (idComite!= undefined && numSesion!= undefined && tipo!= undefined)
        {
            res = await docM.findJoint({sesion:'idSesion',documento:'idTipoDoc',tipoDoc:''},{idComite:idComite,numSesion:numSesion,'tipoDoc.idTipoDoc':tipo},['documento.*','numSesion','idComite','tipoDoc.nombre','tipoDoc.idTipoDoc'])
        }    
        return res;
    }

    auth = async(idUsuario,dir)=>{
        let aux = undefined; //Guarda los resultados de las queries

        if (!!idUsuario && !!dir){
            //Si el usuario es admin que pueda ver cualquer documento
            aux = await usrM.find({idUsuario:idUsuario,tipoUsuario:1,borrado:0});
            dir = dir.substring(1) 
            if (!aux)
            {   
                //Si no es admin se corrobora que sea miembro actualmente en el comite que realizo la sesion
                aux = await docM.findCustom("select ruc.*,sesion.idSesion,idDocumento from ruc inner join sesion ON ruc.idComite=sesion.idComite inner join documento  ON documento.idSesion=sesion.idSesion WHERE urlDocumento = '"+dir+"' AND ruc.idUsuario="+idUsuario);
                if (!!aux)
                    return true;
                else
                    return false;
            }
            else
                return true;
        }
        else
            return false;
    }
}

const documentoO = new documentoC();

module.exports = documentoO;