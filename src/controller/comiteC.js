const model = require("../model/model");
const com = new model("comite");
const usr = new model("user");
const ruc = new model("RUC");
const controller = require("./controller");
const val = require('validator');

class comiteC extends controller{
    constructor(){
        super();
    }

    crear = async(comite)=>{
        try{
            var err = [];
            if (!val.isAlpha(comite,['es-ES']) )
                err.push("Solo se permiten letras en el nombre del comite");
            if (!val.isLength(comite,{min:4,max:20}))
                err.push("El nombre del comite debe ser menor a 20 caracteres y mayor a 3 caracteres");
            
            if (await com.existe({comite:comite}))
                err.push("Ya hay un comite con ese nombre");

            if (err.length === 0)
                await com.crear({comite:comite});
            return err;
        }catch(e){
            console.log(e);
            return undefined;
        }
    }
 
    editar = async(comite,idUsuario,idComite)=>{
        try{
            let comData = await com.find({idComite:idComite});
            if (comData === undefined){
                var err = [];
                if (!val.isAlpha(comite,['es-ES']) )
                    err.push("Solo se permiten letras en el nombre del comite");
                if (!val.isLength(comite,{min:4,max:20}))
                    err.push("El nombre del comite debe ser menor a 20 caracteres y mayor a 3 caracteres");

                if (await com.existe({comite:comite,}))
                    if (!comData.idComite != idComite)
                        err.push("Ya hay un comite con ese nombre");
                let rucData = ruc.find();
                
                

                if (err.length === 0)
                    await com.editar({comite:comite},{idComite:idComite});
                return err;
            }
            return undefined;
        }catch(e){
            console.log(e);
            return undefined;
        }
    }

    ver = async(idComite= undefined)=>{
        try{
            if (idComite!= undefined)            
                return await com.find({idComite:idComite});
            else
                return await com.find();
        }catch(e){
            console.log(e);
            return undefined;
        }
    }

    borrar = async(idComite)=>{
        try{            
            await com.borrarS({idComite:idComite});
            return true;
        }catch(e){
            console.log(e);
            return false;
        }
    }

    restaurar = async(idComite)=>{
        try{            
            await com.restaurarS({idComite:idComite});
            return true;
        }catch(e){
            console.log(e);
            return false;
        }
    }

    buscar = async(words)=>{
        try{            
            return await com.search(words);
        }catch(e){
            console.log(e);
            return undefined;
        }
    }
}

module.exports = comiteC;