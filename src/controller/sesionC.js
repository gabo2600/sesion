const async = require("hbs/lib/async");
const model = require("../model/model");
const ses = new model("sesion");
const com = new model("comite");
const controller = require("./controller");
const val = require('validator');



class sesionC extends controller{
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
        else{
            return undefined;
        } 
    }
}

module.exports = sesionC;