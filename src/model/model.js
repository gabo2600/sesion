const query = require("../Db/coneccion");

class Model{

    constructor(tabla) {
        this.tab = tabla;
    }

    crear = async(par)=>{
        let val = Object.values(par);
        let parC = '';
        val.unshift(undefined);

        for(let i = 0 ; i< val.length ; i++)
        {
            parC = parC+'?';
            if (i != val.length-1)
                parC = parC+',';
        }
        let sql = "INSERT INTO "+this.tab+" VALUES("+parC+")";
        if (await query(sql,val))
            return true;
        else
            return false;
    }

    borrar = async(par)=>{
        let sql = "DELETE FROM "+this.tab+" WHERE ";
        try{
            let keys = Object.keys(par);
            let val = Object.values(par);

            if (keys.length>0)
            {
                par = '';
                for (let i = 0; i<keys.length; i++){
                    if (typeof val[i] === "string")
                        par =par+ keys[i]+'="'+val[i]+'"';
                    else
                        par =par+ keys[i]+'='+val[i];
                    if (i != val.length-1)
                        par = par+' AND ';
                }
                sql = sql+par;

                if (await query(sql))
                    return true;
                else
                    return false;
            }
            else
                return false;
        }catch(e){
            console.log(e)
            return false;
        }
    }

    borrarS = async(par)=>{
        let sql = "UPDATE "+this.tab+" SET borrado=1 WHERE ";
        try{
            let keys = Object.keys(par);
            let val = Object.values(par);

            if (keys.length>0)
            {
                par = '';
                for (let i = 0; i<keys.length; i++){
                    if (typeof valP[i] === "string")
                        par =par+ keys[i]+'="'+val[i]+'"';
                    else
                        par =par+ keys[i]+'='+val[i];
                    if (i != val.length-1)
                        par = par+' AND ';
                }
                sql = sql+par;

                if (await query(sql))
                    return true;
                else
                    return false;
            }
            else
                return false;
        }catch(e){
            console.log(e)
            return false;
        }
    }

    restaurarS = async(par)=>{
        let sql = "UPDATE "+this.tab+" SET borrado=0 WHERE ";
        try{
            let keys = Object.keys(par);
            let val = Object.values(par);

            if (keys.length>0)
            {
                par = '';
                for (let i = 0; i<keys.length; i++){
                    if (typeof valP[i] === "string")
                        par =par+ keys[i]+'="'+val[i]+'"';
                    else
                        par =par+ keys[i]+'='+val[i];
                    if (i != val.length-1)
                        par = par+' AND ';
                }
                sql = sql+par;

                if (await query(sql))
                    return true;
                else
                    return false;
            }
            else
                return false;
        }catch(e){
            console.log(e)
            return false;
        }
    }

    editar = async(par,where)=>{
        let sql = "UPDATE "+this.tab;
        try{
            let keysP = Object.keys(par);
            let valP = Object.values(par);
            let keysW = Object.keys(where);
            let valW = Object.values(where);

            if (keysP.length>0 && keysW.length>0)
            {
                where = '';
                for (let i = 0; i<keysW.length; i++){
                    if (typeof valW[i] === "string")
                        where =where+ keysW[i]+'="'+valW[i]+'"';
                    else
                        where =where+ keysW[i]+'='+valW[i];
                    if (i != valW.length-1)
                        where = where+' AND ';
                }

                par = '';
                for (let i = 0; i<keysP.length; i++){
                    if (typeof valP[i] === "string")
                        par =par+ keysP[i]+'="'+valP[i]+'"';
                    else
                        par =par+ keysP[i]+'='+valP[i];
                    
                    if (i != valP.length-1)
                        par = par+' , ';
                }
                console.log([sql,par,where]);
                
                sql = sql + " SET "+par+" WHERE "+where;

                if (await query(sql))
                    return true;
                else
                    return false;
            }
            else
                return false;
        }catch(e){
            console.log(e)
            return false;
        }
    }

    find = async(par= undefined)=>{
        let sql = "SELECT * FROM "+this.tab;
        try{
            

            if (par!= undefined)
            {
                let keys = Object.keys(par);
                let val = Object.values(par);
                sql = sql+' WHERE ';
                par = '';
                for (let i = 0; i<keys.length; i++){
                    if (typeof val[i] === "string")
                        par =par+ keys[i]+'="'+val[i]+'"';
                    else
                        par =par + keys[i]+'='+val[i];
                    if (i != val.length-1)
                        par = par+' AND ';
                }
                sql = sql+par;
            }
            
            let res = await query(sql);
            return res[0];

        }catch(e){
            console.log(e)
            return false;
        }
    }

    existe = async(par)=>{
        let sql = "SELECT * FROM "+this.tab+" WHERE ";
        try{
            let keys = Object.keys(par);
            let val = Object.values(par);

            if (keys.length>0)
            {
                par = '';
                for (let i = 0; i<keys.length; i++){
                    if (typeof val[i] === "string")
                        par =par+ keys[i]+'="'+val[i]+'"';
                    else
                        par =par + keys[i]+'='+val[i];
                    if (i != val.length-1)
                        par = par+' AND ';
                }
                sql = sql+par;
                let res = await query(sql);
                res = res[0];
                if (res.length>0)
                    return true;
                else
                    return false;
            }
            else
                return false;
        }catch(e){
            console.log(e)
            return false;
        }
    }
}

module.exports = Model;