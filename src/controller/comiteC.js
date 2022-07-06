const model = require("../model/model");
const com = new model("comite");
const usr = new model("usuario");
const ruc = new model("ruc");
const controller = require("./controller");
const val = require('validator');

class comiteC extends controller{
    constructor(){
        super();
    }

    crear = async(comite)=>{
        try{
            var err = []; //guarda los errores de las validaciones

            if (!val.isAlpha(comite, ['es-ES'],{ignore:' '}) )
                err.push("Solo se permiten letras en el nombre del comite");

            if (!val.isLength(comite,{min:4,max:20}))
                err.push("El nombre del comite debe ser menor a 20 caracteres y mayor a 3 caracteres");
            
            //se quitan los espacios            
            comite = comite.replace(/\s/g , "-");

            if (await com.existe({comite:comite,borrado:0}))
                err.push("Ya hay un comite con ese nombre");

            //si no hay errores que cree el comite
            if (err.length === 0)
                await com.crear({comite:comite});
            return err;
        }catch(e){
            console.log(e);
            return undefined;
        }
    }

    editar = async(idComite,comite,miembros)=>{
        let c = await com.find({idComite:idComite,borrado:0});

        if (typeof idComite === "number" && typeof comite === "string" && typeof miembros === "object"){
            if (c.length>0){
                c = c[0];
                comite = comite.replace(/\s/g ,"-")
                if (comite != c.comite && idComite == c.idComite)//Cambio el nombre
                    await com.editar({comite:comite},{idComite:idComite});

                await ruc.borrar({idComite:idComite});
                
                for(let i  =0 ; i<miembros.length ; i++)
                {
                    await ruc.crear({
                        idUsuario:parseInt(miembros[i].idUsuario),
                        idComite:idComite,
                        esResp:parseInt(miembros[i].esResp),
                    },false);
                }
                return true;
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

    ver = async(idComite= undefined,borrado=undefined,param = undefined)=>{
        let res = undefined;
        //Muestra el comite y su respectivo responsable
        let sql = "SELECT comite.idComite,comite,comite.borrado,responsable  FROM comite LEFT JOIN  (SELECT CONCAT(nombre ,' ', apellidoP ,' ', apellidoM) as responsable,ruc.idComite FROM ruc NATURAL JOIN usuario WHERE esResp=1 )  as t1 ON t1.idComite=comite.idComite";
        if (borrado!= undefined)
            sql+= " WHERE comite.borrado=1";
        else
            sql+= " WHERE comite.borrado=0";
        
        if (param!= undefined)
            sql+= " AND comite LIKE '%"+param+"%' OR responsable LIKE '%"+param+"%'";
        try{
            if (idComite!= undefined){            
                res = await com.find({idComite:idComite,borrado:0});
                res = res[0];
                res.comite = res.comite.replace(/-/g,' ')
            }else{
                res = await com.findCustom(sql);
                if (res!= undefined)
                    for (let i = 0 ; i<res.length ; i++){
                        res[i].comite = res[i].comite.replace(/-/g,' ')
                        if (res[i].responsable != undefined)
                        res[i].responsable = res[i].responsable.replace(/-/g,' ');
                        else
                            res[i].responsable = "<div style='color:var(--dan)'>SIN RESPONSABLE<div>"
                    }
            }
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

    verMiembros = async(idComite)=>{
        try{
            let res = await usr.findJoint({usuario:"idUsuario",ruc:''},{idComite:idComite,"usuario.borrado":0},["usuario.idUsuario","nombre","apellidoP","apellidoM","esResp"],);
            if (res!= undefined)
                for (let i = 0 ; i<res.length ; i++){
                    res[i].nombre = res[i].nombre.replace(/-/g,' ')
                    res[i].apellidoP = res[i].apellidoP.replace(/-/g,' ')
                    res[i].apellidoM = res[i].apellidoM.replace(/-/g,' ')
                }
            return res;
        }catch(e){
            console.log(e);
            return undefined;
        }
    }

    verUsuarios = async(idComite)=>{
        let sql1 = "select idUsuario,nombre,apellidoP,apellidoM from usuario WHERE borrado=0 AND (NOT tipoUsuario=1)";
        let sql2 = "select usuario.idUsuario,nombre,apellidoP,apellidoM from usuario LEFT JOIN ruc on ruc.idUsuario=usuario.idUsuario WHERE usuario.borrado=0 AND idComite="+idComite;   
        
        let res1 = await usr.findCustom(sql1);  //Todos los usuarios        
        let res2 = await usr.findCustom(sql2); //miembros del comite
        
        if (res2!= undefined){
            for(let i = 0 ; i<res2.length ; i++){
                res1 = res1.filter( r => r.idUsuario!=res2[i].idUsuario );
            }
        }
        if (!!res1)
            for (let i = 0 ; i<res1.length ; i++){
                res1[i].nombre = res1[i].nombre.replace(/-/g,' ')
                res1[i].apellidoP = res1[i].apellidoP.replace(/-/g,' ')
                res1[i].apellidoM = res1[i].apellidoM.replace(/-/g,' ')
            }
        return res1;
    }
}

const comiteO = new comiteC();

module.exports = comiteO;