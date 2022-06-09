const model = require("../model/model");
const com = new model("comite");
const usr = new model("usuario");
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
 

    editar = async(idComite,comite,miembros)=>{
        let c = await com.find({idComite:idComite});
        

        if (typeof idComite === "number" && typeof comite === "string" && typeof miembros === "object"){
            if (c.length>0){
                c = c[0];
                console.log([comite, c.comite , idComite , c.idComite]);
                if (comite != c.comite && idComite == c.idComite)//Cambio el nombre
                    await com.editar({comite:comite},{idComite:idComite});

                await ruc.borrar({idComite:idComite});
                console.log(idComite);
                
                for(let i  =0 ; i<miembros.length ; i++)
                {
                    await ruc.crear({
                        idUsuario:parseInt(miembros[i].idUsuario),
                        idComite:idComite,
                        esResp:parseInt(miembros[i].esResp),
                    });
                }
            }
            else
                return false;

        }else{
            console.log([idComite,comite,miembros]);
            console.log([typeof idComite,typeof comite,typeof miembros]);

            console.log("Datos incorrectos comiteC.editar");
            return false;

        }
            
    }

    ver = async(idComite= undefined,borrado)=>{
        let res = undefined;
        //Muestra el comite y su respectivo responsable
        let sql = "SELECT comite.idComite,comite.comite,comite.borrado,CONCAT(t1.nombre ,' ', t1.apellidoP ,' ', t1.apellidoM) as responsable  FROM comite LEFT JOIN  (SELECT * FROM ruc NATURAL JOIN usuario WHERE esResp=1 )  as t1 ON t1.idComite=comite.idComite"
        if (borrado!= undefined)
            sql+= " WHERE comite.borrado=1";
        else
            sql+= " WHERE comite.borrado=0";

        try{
            if (idComite!= undefined){            
                res = await com.find({idComite:idComite});
                res = res[0];
            }else
                res = await com.findCustom(sql);
            return res;
        }catch(e){
            console.log(e);
            return undefined;
        }
    }

    borrar = async(idComite)=>{
        try{            
            if (await com.borrarS({idComite:idComite}))
                return true;
            else
                return false;
        }catch(e){
            console.log(e);
            return false;
        }
    }

    restaurar = async(idComite)=>{
        try{            
            if (await com.restaurarS({idComite:idComite}))
                return true;
            else
                return false;
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

    verMiembros = async(idComite)=>{
        try{            
            return await usr.findJoint({usuario:"idUsuario",ruc:''},{idComite:idComite});
        }catch(e){
            console.log(e);
            return undefined;
        }
    }
    verUsuarios = async(idComite)=>{
        try{  
            return await usr.findCustom("SELECT * FROM (SELECT IfNull(idComite, 0) as idComite,usuario.idUsuario,nombre,apellidoP,apellidoM,IfNull(esResp, 0) as esResp FROM usuario LEFT JOIN ruc ON usuario.idUsuario=ruc.idUsuario WHERE usuario.tipoUsuario=0) AS t1 WHERE NOT idComite="+idComite);          
        }catch(e){
            console.log(e);
            return undefined;
        }
    }
}

module.exports = comiteC;