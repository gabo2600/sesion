const C = require("../Db/coneccion");
const Con = new C();
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

    find(param?,eliminados?, campos?) Consulta los datos de la tabla
        Uso
        usuario.find({nombre:"Juan",apellidoP:"Perez"});
        recibe un objeto con los datos del elemento a borrar para localizarlo,
        si se reciben datos entonces se retorna solo el primero en coincidir
        
        Uso alternativo
        usuario.find();
        Si no se mandan parametros se retornan todos los datos en la tabla

        El parametro campos define los campos que se mostraran de la busqueda
        si se deja vacio se mostraran todos los campos,es un tipo de datos Array
        Ejemplo
        
        tabla  create table emp(idEmp,nom,apP,apM,puesto)
        uso emp.find({idEmp:1},undefined,["nom","apM"]);

        solo mostrara los campos nom y apM
        
    existe(param,elimiandos) Verifica si un elemento existe
        Uso
        usuario.find({nombre:"Juan",apellidoP:"Perez"});
        recibe un objeto con los datos del elemento a borrar para localizarlo
        si el elemento existe retorna verdadero si no retorna falso

    search(param,eliminados) Verifica si un elemento existe
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

    findJoin(tablas,where,eliminados?,campos?)
        uso
            findJoin({tab1:"ind1",tab2:"ind2",tab3:"ind3"},{ind1:"cond"},false)
        Salida en sql
            SELECT * FROM tab1 INNER JOIN tab2 ON tab1.ind1=tab2.ind1 INNER JOIN tab3 ON tab2.ind2=tab3.ind2 WHERE borrado=1 AND ind1="cond"
        Parametros
            tablas:
                Es un objeto compuesto por las tablas y los valores a vincular de las mismas
                    si se inserta :         {tab1:"ind1",tab2:"ind2"}
                    la salida sera : SELECT * FROM tab1 INNER JOIN tab2 ON tab1.ind1=tab2.ind1
                el valor a vincular de el ultimo objeto nunca se usa debido a que su unica funcion es vincular con la siguente tabla
            where:
                Recibe un objeto con las condiciones para buscar
                si se ingresa :   {idTab:1,name:"Juan"}
                la salida sera: WHERE idTab=1 AND name="Juan"
            eliminados
                Si no es undefined buscara solo elementos eliminados
            campos
                Arreglo de los campos a mostrar del select en la respuesta, si es nulo se muestran todos
                
        Posibles salidad
            con un where
                Encontro datos: Objeto con los datos
                No encontro datos: undefined
            Sin un where
                Encontro datos: Arreglo de objetos con los datos
                No encontro datos: Arreglo vacio
            Error: undefined
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
            //Se juntan las claves y valores
            keys = keys.join();
            for (let i = 0; i<val.length; i++)
                if (typeof val[i] === "string")
                    val[i] = '"'+val[i]+'"'; //si el valor es una cadena se le añaden comillas dobles ""
            val = val.join();

            let sql = "INSERT INTO "+this.tab+" ("+keys+') VALUES('+val+')';

            let res = await Con.query(sql);
            if (!!res[0] )
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
                console.log(sql);
                let res = await Con.query(sql);

                if (!!res[0] )
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
        return await this.editar({borrado:true},par)
    }

    restaurarS = async(par)=>{
        return await this.editar({borrado:false},par)
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
                sql = sql+par+" WHERE ";
                
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
                let res = await Con.query(sql);

                if (!!res[0] )
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

    find = async(par={},campos = undefined)=>{   
        if (typeof par === 'object' || par === undefined){
            let sql;
            let keys = Object.keys(par);
            let val = Object.values(par);
            let i;
            par = [];

            if (campos== undefined)
                sql = "SELECT * FROM "+this.tab;
            else{
                campos = campos.join(' , ');
                sql = "SELECT "+campos+" FROM "+this.tab;
            }

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
                sql = sql+" WHERE "+par;

            let res = await Con.query(sql);
            if (!!res[0]  ){
                    res = res[0];
                    if (res.length>0)
                        return res;
                    else
                        return undefined;
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

    existe = async(par)=>{
        let res = await this.find(par);
        if (!!res[0])
            return true;
        else
            return false;
    }

    search = async(keys,words='',where={})=>{
        let sql = "SELECT * FROM "+this.tab+" WHERE (";

        if (typeof words === 'string'){
            let i;
            let j;
            var par = [];
            words = words.split(' ');

            for(i = 0 ; i< keys.length ; i++)
                if (words.length>1)
                    for(j = 0 ; j<words.length ; j++)
                        par.push(keys[i]+' LIKE "%'+words[j]+'%"');
                else
                    par.push(keys[i]+' LIKE "%'+words+'%"');
            par = par.join(" OR ");
            sql = sql+par;
            //WHERE adicional
            keys = Object.keys(where);
            let val = Object.values(where);
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
            //Where adicional
            sql = sql+') AND '+par;
            let res = await Con.query(sql);
            
            if (!!res[0]  ){
                    res = res[0];
                    return res;
            }else
            {
                    console.log("Error en Model.find(par):");
                    console.table(res);
                    return undefined;
            }
        }else{
            console.log("Error en  Model.search(keys,words='',where={}): El parametro words debe ser una cadena");
            return false;
        }
    }

    findJoint = async(tablas,where=undefined,campos=false)=>{
        if (typeof tablas === 'object'){
            let sql = undefined;
            
            let keys = Object.values(tablas);
            let tabs = Object.keys(tablas);
            let aux = tabs[0]; //Variable temporal que guardas parte de la cadena sql
            let wk,wv,i;

            for(i = 1 ; i< keys.length ; i++){
                aux+= ' INNER JOIN '+tabs[i]+' ON '+tabs[i-1]+"."+keys[i-1]+'='+tabs[i]+"."+keys[i-1]
            }
            //Armado de la Con.query sin el where
            if (!campos)
                sql = "SELECT * FROM "+aux;
            else{
                campos = campos.join(' , ');
                sql = "SELECT "+campos+" FROM "+aux;
            }

            //Se añade el where
            aux = []
            if (typeof where === 'object'){  
               wk = Object.keys(where);
               wv = Object.values(where);   
               if (wv.length>0)
                   sql = sql+" WHERE ";
               for (i = 0; i<wv.length; i++)
                    if (typeof wv[i] === "string")
                        wv[i] = '"'+wv[i]+'"';
                aux = [];
                i = 0;
                while(aux.length < wk.length ){
                    aux.push(wk[i]+'='+wv[i]);
                    i++
                }
                
                aux = aux.join(' AND ');
                sql = sql+aux;
            }
            //Se ejecuta la Con.query y se retorna el valor correspondiente
            let res = await Con.query(sql);
            //console.log(sql);
            if (!!res[0]){
                    res = res[0];
                    if (res.length>0)
                        return res;
                    else
                        return undefined;
            }else
            {
                    console.log("Error en Model.findJoint(tablas,where):");
                    console.table(res);
                    return undefined;
            }
        }
        else{
            console.log("Error en  Model.findJoint(tablas,where): Ambos parametros deben ser objetos");
            return undefined;
        }
    }

    findCustom = async(sql)=>{
        var res;
        if (!!sql && typeof sql === "string")
        {
            res = await Con.query(sql);
            if (!!res[0]){
                res = res[0];
                if (res.length>0)
                    return res;
                else
                    return undefined;
            }else
            {
                    console.log("Error en Model.findCustom(tablas,where):");
                    console.table(res);
                    return undefined;
            }
        }
        else{
            console.log("Error en Model.findCustom(sql): el parametro sql debe ser una cadena");
            return undefined;
        }
    }
}

module.exports = Model;

