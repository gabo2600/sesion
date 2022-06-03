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

      *** NOTA: Solo se pueden editar elementos no borrados con borradoS**
*/ 

class Model{

    constructor(tabla) {
        this.tab = tabla;
    }

    crear = async(par)=>{
        if (typeof par === 'object'){
            //se sacan las claves y valores del objeto del paramentro
            let val = Object.values(par);
            let keys = Object.keys(par);
            //se añade el campo de borrado a las claves y valores este valiendo 0
            val.push(0);
            keys.push('borrado');

            //Se juntan las claves y valores
            keys = keys.join();
            for (let i = 0; i<val.length; i++)
                if (typeof val[i] === "string")
                    val[i] = '"'+val[i]+'"'; //si el valor es una cadena se le añaden comillas dobles ""
            val = val.join();

            let sql = "INSERT INTO "+this.tab+" ("+keys+') VALUES('+val+')';

            let res = await query(sql);
            if (res[0] !== undefined)
                return res[0].insertId;
            else
            {
                console.log("Error en  Model.crear(par):");
                console.table(res);
                return 0;
            }
        }else{
            console.log("Error en  Model.crear(par): El parametro par debe ser un objeto");
            return false;
        }
    }

    borrar = async(par)=>{
        
        if (typeof par === 'object'){
            //se sacan las claves y valores del objeto del paramentro
            let keys = Object.keys(par);
            let val = Object.values(par);

            if (keys.length>0)
            {
                par = [];
                let i;
                for (i = 0; i<val.length; i++)
                    if (typeof val[i] === "string")
                        val[i] = '"'+val[i]+'"';//si el valor es una cadena se le añaden comillas dobles ""

                par = [];
                i = 0;
                while(par.length < keys.length ){
                    par.push(keys[i]+' = '+val[i]); //se unen los valores y llaver con un = de pormedio
                    i++
                }
                par = par.join(' AND '); //Los elementos ya unidos con un = son pegados de nuevo con un AND intermedio
                
                let sql = "DELETE FROM "+this.tab+" WHERE "+par;
                
                let res = await query(sql);

                if (res[0] !== undefined)
                    return true;
                else
                {
                    console.log("Error en Model.borrar(par):");
                    console.table(res);
                    return false;
                }
            }
            else
                console.log("Error en  Model.borrar(par): Se recibio un objeto vacio");
            return false;
        }else{
            console.log("Error en  Model.borrar(par): El parametro par debe ser un objeto");
            return false;
        }
    }

    borrarS = async(par)=>{
        let sql = "UPDATE "+this.tab+" SET borrado=1 WHERE ";
        if (typeof par === 'object'){
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
                let res = await query(sql);

                if (res[0] !== undefined)
                    return true;
                else
                {
                    console.log("Error en Model.borrarS(par):");
                    console.table(res);
                    return false;
                }
                
            }
            else
                console.log("Error en  Model.borrarS(par): Se recibio un objeto vacio");
            return false;
        }else{
            console.log("Error en  Model.borrarS(par): El parametro par debe ser un objeto");
            return false;
        }
    }

    restaurarS = async(par)=>{
        
        if (typeof par === 'object'){
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
                let sql = "UPDATE "+this.tab+" SET borrado=0 WHERE "+par;
                let res = await query(sql);

                if (res[0] !== undefined)
                    return true;
                else
                {
                    console.log("Error en Model.restaurarS(par):");
                    console.table(res);
                    return false;
                }
                
            }
            else
                console.log("Error en  Model.restaurarS(par): Se recibio un objeto vacio");
            return false;
        }else{
            console.log("Error en  Model.restaurarS(par): El parametro par debe ser un objeto");
            return false;
        }
    }

    editar = async(param,where)=>{
        let sql = "UPDATE "+this.tab+" SET ";
        if (typeof param === 'object' && typeof where === 'object' ){
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
                let res = await query(sql);

                if (res[0] !== undefined)
                    return true;
                else
                {
                    console.log("Error en Model.editar(par):");
                    console.table(res);
                    return false;
                }
                
            }
            else
                console.log("Error en  Model.editar(par): en alguno de los parametros o en ambos se recibio un objeto vacio");
            return false;
        }else{
            console.log("Error en  Model.editar(param,where): Los parametro param y where debe ser un objeto");
            return false;
        }
    }

    find = async(par={},Eliminados=false)=>{   
        if (typeof par === 'object' || par === undefined){
            let sql = "SELECT * FROM "+this.tab;
            let keys = Object.keys(par);
            let val = Object.values(par);
            let i;
            par = [];

            if (Eliminados)
                sql = sql+" WHERE borrado=1 ";
            else
                sql = sql+" WHERE borrado=0 ";

            for (i = 0; i<val.length; i++) //si el valor es una cadena se le añaden comillas
                if (typeof val[i] === "string")
                    val[i] = '"'+val[i]+'"';
            
            i = 0;
            if (keys.length>0){ //si hay 
                while(par.length < keys.length ){
                    par.push(keys[i]+'='+val[i]);
                    i++
                }
                par = par.join(' AND ');
            }
            if (typeof par === 'string')
                sql = sql+" AND "+par;

            let res = await query(sql);
            
            if (res[0] !== undefined ){
                    res = res[0];
                    if (typeof par === 'string' ) //si hay un where que arroje el primer resultado solamente
                        if (res!==undefined)
                            return res[0];
                        else
                            return undefined;
                    else
                        return res; //si no que arroje todos
            }else
            {
                    console.log("Error en Model.find(par):");
                    console.table(res);
                    return undefined;
            }
        }else{
            console.log("Error en  Model.find(par?): El parametro par debe ser un objeto si se elije ponerlo");
            return false;
        }
    }

    existe = async(par,Eliminados=false)=>{
        if (typeof par === 'object'){
            let keys = Object.keys(par);
            let val = Object.values(par);
            let sql = undefined;

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


                if (Eliminados)
                    sql = "SELECT * FROM "+this.tab+" WHERE borrado=1 AND "+par;
                else
                    sql = "SELECT * FROM "+this.tab+" WHERE borrado=0 AND "+par;



                let res = await query(sql);
            
                if (res[0] !== undefined ){
                        res = res[0];
                        if (res.length>0)
                            return true;
                        else
                            return false;
                }else
                {
                        console.log("Error en Model.existe(par):");
                        console.table(res);
                        return undefined;
                }
            }
            else
                console.log("Error en  Model.existe(par): Se recibio un objeto vacio"); 
            return false;
        }else{
            console.log("Error en  Model.existe(par): El parametro par debe ser un objeto");
            return false;
        }
    }

    search = async(words,Eliminados=false)=>{
        let sql = undefined;
        let sqlAux = "DESCRIBE "+this.tab;

        if (Eliminados)
            sql = "SELECT * FROM "+this.tab+" WHERE borrado=1 AND ";
        else
            sql = "SELECT * FROM "+this.tab+" WHERE borrado=0 AND ";

        if (typeof words === 'string'){
            let i;
            let j;
            var par = [];
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
            let res = await query(sql);
            
            if (res[0] !== undefined ){
                    res = res[0];
                    return res;
            }else
            {
                    console.log("Error en Model.find(par):");
                    console.table(res);
                    return undefined;
            }

        }else{
            console.log("Error en  Model.search(words): El parametro words debe ser una cadena");
            return false;
        }
    }
}

module.exports = Model;