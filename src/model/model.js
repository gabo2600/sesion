const query = require("../Db/coneccion");

/*
Modulo de modelos genericos de mysql

Para usarlo se importa y se inicializa el un objeto que funjira de modelo
Ejemplo:
    let model = require("model");

    let usuario = new model('usuario');

    NOTA: todos los elementos de la tabla deben tener un ultimo campo llamado borrado
          el cual permite el SoftDelete

Este modelo cuenta con las siguentes funciones

    crear(param) Inserta un nuevo dato en la tabla
        Uso:
        usuario.crear({nombre:"Juan",apellidoP:"Perez",edad:11});
        recibe un objeto con los atributos del dato a crear

    borrar(param) Borra un dato en la tabla
        Uso
        usuario.borrar({nombre:"Juan",apellidoP:"Perez"});
        recibe un objeto con los datos del elemento a borrar para localizarlo

    borrarS(param) Realiza un SoftDelete a un dato de la tabla
        Uso
        usuario.borrarS({nombre:"Juan",apellidoP:"Perez"});
        recibe un objeto con los datos del elemento a borrar para localizarlo
        el borrado se realiza cambiando el valor del campo borrado de 0 a 1

    restaurarS(param) Restaura un elemento borrado por SoftDelete
        Uso
        usuario.restaurarS({nombre:"Juan",apellidoP:"Perez"});
        recibe un objeto con los datos del elemento a restaurar para localizarlo
        la restauracion se realiza cambiando el valor del campo borrado de 1 a 0

    find(param=undefined) Consulta los datos de la tabla
        Uso
        usuario.find({nombre:"Juan",apellidoP:"Perez"});
        recibe un objeto con los datos del elemento a borrar para localizarlo,
        si se reciben datos entonces se retorna solo el primero en coincidir
        
        Uso alternativo
        usuario.find();
        Si no se mandan parametros se retornan todos los datos en la tabla
    
    existe(param) Verifica si un elemento existe
        Uso
        usuario.find({nombre:"Juan",apellidoP:"Perez"});
        recibe un objeto con los datos del elemento a borrar para localizarlo
        si el elemento existe retorna verdadero si no retorna falso

    search(param) Verifica si un elemento existe
        Uso
        usuario.search({nombre:"Juan",apellidoP:"Perez"});
        recibe un objeto con los datos del elemento a borrar para localizarlo
        la funcion retorna un arreglos de objetos con todos los elementos que coinciden con la busqueda
    
    editar(param,where) Modifica los datos de los elementos
        uso
            usuario.editar({"edad:30, apellido:Aguilar"},{idUsuario:34});
        recibe 2 objetos el primero para los campos a cambiar y sus nuevos valores
        y el segundo con los datos para localizar el elemento a modificar
*/ 

class Model{

    constructor(tabla) {
        this.tab = tabla;
    }

    crear = async(par)=>{
        try{
            let val = Object.values(par);
            let keys = Object.keys(par);
            val.push(0);
            keys.push('borrado');

            keys = keys.join();
            for (let i = 0; i<val.length; i++)
                if (typeof val[i] === "string")
                    val[i] = '"'+val[i]+'"';
            val = val.join();

            let sql = "INSERT INTO "+this.tab+" ("+keys+') VALUES('+val+')';

            console.log(sql);
            console.log(await query(sql));
        }catch(e){
            console.log(e);
        }
    }

    borrar = async(par)=>{
        let sql = "DELETE FROM "+this.tab+" WHERE ";
        try{
            let keys = Object.keys(par);
            let val = Object.values(par);

            if (keys.length>0)
            {
                par = [];
                let i;
                for (i = 0; i<val.length; i++)
                    if (typeof val[i] === "string")
                        val[i] = '"'+val[i]+'"';

                par = [];
                i = 0;
                while(par.length < keys.length ){
                    par.push(keys[i]+' = '+val[i]);
                    i++
                }
                par = par.join(' AND ');
                sql = sql+par;
 
                return await query(sql);
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
                par = [];
                let i;
                for (i = 0; i<val.length; i++)
                    if (typeof val[i] === "string")
                        val[i] = '"'+val[i]+'"';

                par = [];
                i = 0;
                while(par.length < keys.length ){
                    par.push(keys[i]+' = '+val[i]);
                    i++
                }
                par = par.join(' AND ');
                sql = sql+par;

                return await query(sql);
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
                par = [];
                let i;
                for (i = 0; i<val.length; i++)
                    if (typeof val[i] === "string")
                        val[i] = '"'+val[i]+'"';
                
                let run = 0, first = 0, second = 0;
                par = [];
                i = 0;
                while(par.length < keys.length ){
                    par.push(keys[i]+' = '+val[i]);
                    i++
                }
                par = par.join(' AND ');
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

    editar = async(param,where)=>{
        let sql = "UPDATE "+this.tab+" SET ";
        try{
            if (Object.keys(param).length>0 && Object.keys(where).length>0)
            {
                let keys = Object.keys(param);
                let val = Object.values(param);
                let par = [];
                let i;
                for (i = 0; i<val.length; i++)
                    if (typeof val[i] === "string")
                        val[i] = '"'+val[i]+'"';                
                i = 0;
                while(par.length < keys.length ){
                    par.push(keys[i]+'='+val[i]);
                    i++
                }
                par = par.join();
                sql = sql+par+" WHERE borrado=0 AND ";
                
                keys = Object.keys(where);
                val = Object.values(where);
                par = [];
                for (i = 0; i<val.length; i++)
                    if (typeof val[i] === "string")
                        val[i] = '"'+val[i]+'"';                
                i = 0;
                while(par.length < keys.length ){
                    par.push(keys[i]+'='+val[i]);
                    i++
                }
                par = par.join(' AND ');
                sql = sql+par;

                console.log(sql);

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

    find = async(par=undefined)=>{   
        try{
            let sql = "SELECT * FROM "+this.tab+" WHERE borrado=0 ";
            
            if (par!=undefined){
                let keys = Object.keys(par);
                let val = Object.values(par);
                par = [];
                let i;
                for (i = 0; i<val.length; i++)
                    if (typeof val[i] === "string")
                        val[i] = '"'+val[i]+'"';
                par = [];
                i = 0;
                while(par.length < keys.length ){
                    par.push(keys[i]+'='+val[i]);
                    i++
                }
                par = par.join(' AND ');
                sql = sql+" AND "+par;
            }
            let res = await query(sql);
            res = res[0];
            if (par!=undefined) //si hay un where que arroje el primer resultado solamente
                if (res!==undefined)
                    return res[0];
                else
                    return undefined;
            else
                return res; //si no que arroje todos

        }catch(e){
            console.log(e.message)
            return false;
        }
    }

    findElim = async(par=undefined)=>{   
        try{
            let sql = "SELECT * FROM "+this.tab+" WHERE borrado=0 ";;
            
            if (par!=undefined){
                let keys = Object.keys(par);
                let val = Object.values(par);
                par = [];
                let i;
                for (i = 0; i<val.length; i++)
                    if (typeof val[i] === "string")
                        val[i] = '"'+val[i]+'"';
                par = [];
                i = 0;
                while(par.length < keys.length ){
                    par.push(keys[i]+'='+val[i]);
                    i++
                }
                par = par.join(' AND ');
                sql = sql+" AND "+par;
            }
            let res = await query(sql);
            res = res[0];
            if (par!=undefined) //si hay un where que arroje el primer resultado solamente
                if (res!==undefined)
                    return res[0];
                else
                    return undefined;
            else
                return res; //si no que arroje todos

        }catch(e){
            console.log(e.message)
            return false;
        }
    }

    existe = async(par)=>{
        let sql = "SELECT * FROM "+this.tab+" WHERE borrado=0 AND ";
        try{
            let keys = Object.keys(par);
            let val = Object.values(par);

            if (keys.length>0)
            {
                par = [];
                let i;
                for (i = 0; i<val.length; i++)
                    if (typeof val[i] === "string")
                        val[i] = '"'+val[i]+'"';
                par = [];
                i = 0;
                while(par.length < keys.length ){
                    par.push(keys[i]+'='+val[i]);
                    i++
                }
                par = par.join(' AND ');

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
            console.log("Error en : Model.existe(par) : "+e.message)
            return false;
        }
    }

    search = async(words)=>{
        let sql = "SELECT * FROM "+this.tab+" WHERE borrado=0 AND ";
        let sqlAux = "DESCRIBE "+this.tab;

        try{ // ' param like %or%'
            console.log(words);
            let i;
            let j;
            var par = [];
            let res;
            let keys = await query(sqlAux);
            
            keys = keys[0];
            
            for(i = 0 ; i<keys.length ; i++)
                keys[i] = keys[i].Field;
            
            words = words.split(' ');
            keys = keys.slice(1,-1);

            for(i = 0 ; i<keys.length ; i++)
                if (words.length>1)
                    for(j = 0 ; j<words.length ; j++)
                        par.push(keys[i]+' LIKE "%'+words[j]+'%"');
                else
                    par.push(keys[i]+' LIKE "%'+words+'%"');

            par = par.join(" OR ");
            sql = sql+par;
            console.log(sql);

            res = await query(sql);
            return res[0];

        }catch(e){
            console.log(e)
            return false;
        }
    }
}

module.exports = Model;