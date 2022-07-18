const model = require("../model/model");
//Modelos
const ses = new model("sesion");
const com = new model("comite");
const tipoD = new model("tipoDoc");
const doc = new model("documento");
const obs = new model("observacion");



//Utilidades
const controller = require("./controller");
const val = require('validator');
var fs = require("fs");


class sesionC extends controller {
    constructor() {
        super();
    }

    #intToBin = (x, isEdit = false) => { //Funcion privada para convertir valores numericos a arreglos donde 0 es ' ' y uno es 'X'
        let res = undefined;
        switch (x) {
            case 0:
                if (isEdit)
                    res = [0, 0, 0];
                else
                    res = [' ', ' ', ' '];
                break;
            case 1:
                if (isEdit)
                    res = [1, 0, 0];
                else
                    res = ['X', ' ', ' '];
                break;
            case 2:
                if (isEdit)
                    res = [0, 1, 0];
                else
                    res = [' ', 'X', ' '];
                break;
            case 3:
                if (isEdit)
                    res = [1, 1, 0];
                else
                    res = ['X', 'X', ' '];
                break;
            case 4:
                if (isEdit)
                    res = [0, 0, 1];
                else
                    res = [' ', ' ', 'X'];
                break;
            case 5:
                if (isEdit)
                    res = [1, 0, 1];
                else
                    res = ['X', ' ', 'X'];
                break;
            case 6:
                if (isEdit)
                    res = [0, 1, 1];
                else
                    res = [' ', 'X', 'X'];
                break;
            case 7:
                if (isEdit)
                    res = [1, 1, 1];
                else
                    res = ['X', 'X', 'X'];
                break;
        }
        return res;
    }

    #binToInt = (x, y, z) => {
        let r = 0;
        if (!!x)
            r += 1;
        if (!!y)
            r += 2;
        if (!!z)
            r += 4;
        return r;
    }

    verComites = async (hash) => { //retorna objeto con los comites a los que es miembro el usuario o un undefined
        let data = undefined; //Variable de los datos del usuario
        let res = undefined; //Respuesta de la funcion

        if (hash != undefined) { //Si los datos de la cookie no son undefined
            data = this.jwtDec(hash);//Se obtiene la info
            if (data !== undefined) {
                //Se buscan los comites en base a el id del usuario
                res = await com.findJoint({ comite: 'idComite', ruc: 'idComite' }, { idUsuario: data.idUsuario, 'comite.borrado': 0 });
                if (!!res)
                    for (let i = 0; i < res.length; i++) //Se remplazan los - por espacios en blanco
                        res[i].comite = res[i].comite.replace(/-/g, ' ');
                return res;
            }
        }
        return res;
    }

    crear = async (asunto, fi, fc, idComite, idUsuario, files) => {
        let err = [];// Variable que almacena los errores contemplados en el proceso

        //Fecha de subida de los archivos de la sesion
        let d = new Date();
        let date = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
        let idSesion; //Id de la sesion recien creada
        let numSesion; //El numero consecutivo de sesion del comite (es el numero de la sesion anterir mas 1)

        var dirActa; //Directorio donde se guardara el acta
        var dirOther; //Directorio donde se guardara la carpeta de trabajo, la convocatoria y el acta preliminar

        //Tipos de documento
        let tipos = await tipoD.find();

        if (asunto != undefined)
            asunto = asunto.replace(/\s+/g, ' ').trim();

        //Validación
        if (!val.isAlphanumeric(asunto, ['es-ES'], { ignore: ' ,  .-_' }))
            err.push("El asunto no puede contener caracteres especiales");
        if (!val.isLength(asunto, { min: 3, max: 60 }))
            err.push("El nombre de usuario debe ser menor a 60 caracteres y mayor a 3 caracteres");
        if (fi > fc)
            err.push("La fecha de inicio es posterior a la de cierre");

        //Si no son enteros se convierten en enteros
        idComite = parseInt(idComite);
        idUsuario = parseInt(idUsuario);

        //Si los datos son validos
        if (err.length < 1) {
            let fileDirs = [] //Variable que almacena directorio final de los archivos

            //se crea una nueva sesion
            //se establece el numero de sesion en base al comite y sus sesiones anteriores
            numSesion = await ses.findCustom("SELECT * FROM sesion WHERE idComite=" + idComite + " ORDER BY numSesion DESC");
            if (numSesion == undefined)
                numSesion = 1;
            else
                numSesion = numSesion[0].numSesion + 1;

            //Se corrobora que el comite existe
            if (await com.existe({ idComite: idComite, borrado: 0 }, ['comite'])) {

                //Se crea la sesion
                idSesion = await ses.crear({ asunto: asunto, fechaInicio: fi, fechaCierre: fc, numSesion: numSesion, idUsuario: idUsuario, idComite: idComite });

                /*
                Se ubican los archivos en su carpeta correspondiente
                -Acta final (Permanente) 
                    COMECyT/1C/1C.15/1C.15.1/1C.15.1.1/COMECyT1C.15.1.1.pdf
                    (Fondo)/(Secciòn)/(serie)/(idComite)/(numSesion)/(Codigo+archivo)

                    1C         15          1           1
                    INMUTABLE  INMUTABLE    idComite    Numero de sesion() COMECyT1C.15.1.1.pdf                                                   

                    Convocatoria,carpeta de trabajo,acta-preeliminar
                    Temp/Asunto/Año/Mes/Dia
                                        └ COMECyT1C.15.1.1.convocatoria.pdf  
                                        └ COMECyT1C.15.1.1.carpeta_de_trabajo.pdf  
                                        └ COMECyT1C.15.1.1.acta_preliminar.pdf                                          
                */
                //Directorios
                dirActa = 'Files/COMECyT/1C/1C.15/1C.15.' + idComite + "/" + "1C15." + idComite + "." + numSesion + "/";
                dirOther = 'Files/Temp/' + asunto.replace(/\s/g, "-") + '/' + fc.replace(/-/g,'/') + '/';
                //Si ya existen que no los cree
                if (!fs.existsSync(dirActa)) {
                    fs.mkdirSync(dirActa, { recursive: true });
                }
                if (!fs.existsSync(dirOther)) {
                    fs.mkdirSync(dirOther, { recursive: true });
                }
                //nombres de los archivos
                tipos[0].nombreArchivo = "COMECyT.1C.15." + idComite + "." + numSesion + tipos[0].nombreArchivo;//Acta
                tipos[1].nombreArchivo = "COMECyT.1C.15." + idComite + "." + numSesion + tipos[1].nombreArchivo;//Conv
                tipos[2].nombreArchivo = "COMECyT.1C.15." + idComite + "." + numSesion + tipos[2].nombreArchivo;//Carp
                tipos[3].nombreArchivo = "COMECyT.1C.15." + idComite + "." + numSesion + tipos[3].nombreArchivo;


                //Se mueven los archivos
                try {
                    tipos[0].nombreArchivo = dirActa + tipos[0].nombreArchivo; //Acta
                    tipos[1].nombreArchivo = dirOther + tipos[1].nombreArchivo; //Conv
                    tipos[2].nombreArchivo = dirOther + tipos[2].nombreArchivo; //Carp
                    tipos[3].nombreArchivo = dirOther + tipos[3].nombreArchivo; //ActaPre

                    await fs.promises.rename(files.acta_final[0].path, tipos[0].nombreArchivo);
                    await fs.promises.rename(files.convocatoria[0].path, tipos[1].nombreArchivo);
                    await fs.promises.rename(files.carpeta_de_trabajo[0].path, tipos[2].nombreArchivo);
                    await fs.promises.rename(files.acta_preliminar[0].path, tipos[3].nombreArchivo);

                    for (let i = 0; i < tipos.length; i++) {
                        doc.crear({ idTipoDoc: i + 1, urlDocumento: tipos[i].nombreArchivo, fechaSubida: date, idSesion: idSesion })
                    }
                } catch (e) { //Si no se movieron bien los archivos que vote error
                    err.push("Error 500 hubo un problema con su solicitud, detalles:" + e.message);
                }

            }
            else
                err.push("Comite no disponible");
        }
        return err;
    }

    ver = async (idComite, idSesion = undefined, param = undefined) => {
        let res = undefined;
        var sql = "SELECT sesion.*,usuario.nombre,usuario.apellidoP,usuario.apellidoM FROM sesion INNER JOIN usuario ON sesion.idUsuario=usuario.idUsuario WHERE usuario.borrado=0 AND idComite=" + idComite;

        if (idComite != undefined) {
            idComite = parseInt(idComite);
            if (!idSesion) {
                if (typeof param === 'string')
                {
                    param = param.split(' ');
                    sql+=' AND ('
                    for(let i = 0 ;i<param.length ; param++){
                        sql = sql+'asunto LIKE "%'+param[i]+'%" OR numSesion LIKE "%'+param[i]+'%" OR fechaInicio LIKE "%'+param[i]+'%" OR fechaCierre LIKE "%'+param[i]+'%" OR usuario.nombre LIKE "%'+param[i]+'%" OR usuario.apellidoP LIKE "%'+param[i]+'%" OR usuario.apellidoM LIKE "%'+param[i]+'%" ';
                        if (i!=param.length-1)
                            sql = sql+" OR ";
                    }
                    sql = sql+')';
                }
                //Se obtiene el nombre completo de usuario y los datos de la sesion
                res = await ses.findCustom(sql);
            }
            else {  //Se obtienen los datos de una sesion especifica
                res = await ses.find({ idSesion: idSesion });
            }

            if (!!res)
                for(let i = 0 ; i<res.length ; i++)
                    res[i].asunto = res[i].asunto.replace(/-/g, ' ')
        }
        return res;
    }

    verAdmin = async (idSes = undefined) => {
        let res = undefined; //Respuesta de la funcion
        let i = undefined; //Entero para los for
        //Se obtiene los datos de la sesion, el codigo de la sesion y el nombre del comite
        let baseSql = 'SELECT * FROM (SELECT sesion.*,comite.comite,CONCAT("1C.15.",sesion.idComite,".",sesion.numSesion) as codigo FROM sesion INNER JOIN comite ON sesion.idComite=comite.idComite) as t1 WHERE idSesion=' + idSes;
        res = await ses.findCustom(baseSql);
        //Los Campos de valor documental, dispDocumental y clasInfo son enteros
        //A continuacion se convertiran en arreglos binarios
        if (!!res)
            for (let i = 0; i < res.length; i++) {
                res[i].valorDocumental = this.#intToBin(res[i].valorDocumental, true);
                res[i].dispDocumental = this.#intToBin(res[i].dispDocumental, true);
                res[i].clasInfo = this.#intToBin(res[i].clasInfo, true);

                if (res[i].valHist == 1)
                    res[i].valHist = true;
                else
                    res[i].valHist = false;

                res[i].comite = res[i].comite.replace(/-/g, ' ');
            }
        return res;
    }

    buscarAdmin = async (param, type, fi, fc) => {
        let res = undefined; //Respuesta de la funcion
        let i = undefined; //Entero para los for
        let baseSql = 'SELECT * FROM (SELECT sesion.*,comite.comite,CONCAT("1C.15.",sesion.idComite,".",sesion.numSesion) as codigo FROM sesion INNER JOIN comite ON sesion.idComite=comite.idComite) as t1'

        //Se convierte en entero el tipo de busqueda a realizar
        type = parseInt(type);
        //Si se mando una busqueda sin un texto a buscar se remplaxza el undefined por una cadena vacia en un vector
        if (param != undefined)
            param = param.split(' '); //Se separan los terminos a buscar
        else
            param = ['']

        switch (type) {
            case 1: //Se busca en base a todos los parametros
                baseSql += " WHERE ";
                for (i = 0; i < param.length; i++) {
                    if (i != 0)
                        baseSql += ' AND ';
                    baseSql += 'comite LIKE "%' + param[i] + '%" OR codigo LIKE "%' + param[i] + '%"';
                }
                break;
            case 2: // Se busca en base al nombre del comite
                baseSql += " WHERE ";
                for (i = 0; i < param.length; i++) {
                    if (i != 0)
                        baseSql += ' AND ';
                    baseSql += ' comite LIKE "%' + param[i] + '%"';
                }
                break;
            case 3: //Se busca en base a un periodo de tiempo
                baseSql += " WHERE ";
                baseSql += ' "' + fi + '" <= fechaInicio AND "' + fc + '" >= fechaCierre;'
                break;
            case 4: //Se busca en base al codigo de la sesion
                baseSql += " WHERE ";
                for (i = 0; i < param.length; i++) {
                    if (i != 0)
                        baseSql += ' AND ';
                    baseSql += ' codigo LIKE "%' + param[i] + '%"';
                }
                break;
        }
        res = await ses.findCustom(baseSql);
        //Los Campos de valor documental, dispDocumental y clasInfo son enteros
        //A continuacion se convertiran en arreglos binarios

        if (!!res)
            for (let i = 0; i < res.length; i++) {
                res[i].valorDocumental = this.#intToBin(res[i].valorDocumental);
                res[i].dispDocumental = this.#intToBin(res[i].dispDocumental);
                res[i].clasInfo = this.#intToBin(res[i].clasInfo);
                res[i].vig = res[i].enTram + res[i].enConc;

                if (res[i].valHist == 1)
                    res[i].valHist = 'X'
                else
                    res[i].valHist = ' ';

                res[i].comite = res[i].comite.replace(/-/g, ' ');
            }

        return res;
    }

    verDoc = async (idSesion = undefined) => {
        let res = undefined;
        if (idSesion != undefined) {
            idSesion = parseInt(idSesion);
            res = await doc.findJoint({ documento: 'idTipoDoc', tipoDoc: '' }, { idSesion: idSesion }, ['documento.idTipoDoc', 'idDocumento', 'fechaSubida', 'tipoDoc.nombre as tipoDocumento']);
        }
        return res;
    }

    editarAdmin = async (idSesion, valorDocumental1, valorDocumental2, valorDocumental3, enT, enC, valHist, dispDoc1, dispDoc2, dispDoc3, clas1, clas2, obs) => {
        let param = {
            valorDocumental: this.#binToInt( //Se toman los valores de las casillas y se combieten a un entero
                valorDocumental1,
                valorDocumental2,
                valorDocumental3
            ),
            enTram: enT,
            enConc: enC,
            valHist: (valHist || 0),
            dispDocumental: this.#binToInt( //Se toman los valores de las casillas y se combieten a un entero
                dispDoc1,
                dispDoc2,
                dispDoc3
            ),
            clasInfo: this.#binToInt(clas1, //Se toman los valores de las casillas y se combieten a un entero
                clas2
            ),
            obs: obs
        }; //los parametros para el edit
        let response = false;
        if (!!idSesion)
            response = await ses.editar(param, { idSesion: idSesion });
        return response;

    }


    editar = async (asunto, fi, fc, idUsuario, files, idSes) => {
        let err = [];// Variable que almacena los errores contemplados en el proceso

        //Fecha de subida de los archivos de la sesion
        let d = new Date();
        let date = d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();

        //variables auxiliares para guardar codigo
        let f1, f2, cod;

        //variables auxiliares para los archivos
        let dir;
        //NOMBRE FINAL DE LOS ARCHIVOS
        var nActa, nConv, nPrel, nCarp;

        //Rutas de los archivos finales
        var dirActa, dirOther;

        //Tipos de documento
        let tipos = await tipoD.find();

        if (asunto != undefined){
            asunto = asunto.replace(/\s+/g, ' ').trim();
            asunto = asunto.replace(/\s/g, "-");
        }
        //Validación
        if (!val.isAlphanumeric(asunto, ['es-ES'], { ignore: ' ,.-_' }))
            err.push("El asunto no puede contener caracteres especiales");
        if (!val.isLength(asunto, { min: 4, max: 20 }))
            err.push("El nombre del comite debe ser menor a 20 caracteres y mayor a 3 caracteres");
        if (fi > fc)
            err.push("La fecha de inicio es posterior a la de cierre");

        idUsuario = parseInt(idUsuario);

        //Si la sesion esta archivada
        if (await !ses.existe({idSesion:idSes,borrado:0}))
            err.push("LA sesion no existe o fue archivada")

        //Si los datos son validos
        if (err.length < 1) {
            //se obtiene el comite para despues sacar el nombre para las carpetas
            f1 = await doc.find({ idTipoDoc: 1, idSesion: idSes });
            f2 = await ses.find({ idSesion: idSes });
            f1 = f1[0];
            f2 = f2[0];

            //Se quita el nombre de los archivos paratener la ruta
            dirActa = f1.urlDocumento.split('/');
            //se saca el codigo
            cod = dirActa.pop();
            dirActa = dirActa.join('/');
            dirActa = dirActa + '/';

            //Codigo de el documento
            cod = cod.split('.');
            cod.pop();
            cod.pop();
            cod = cod.join('.');

            /* Directorio de archivos perecederos
               Si el asunto ha cambiado se renombra la carpeta al nuevo nombre del asunto
               y se cambia la url en la bd
            */
            if (!!asunto)
                asunto = asunto.replace(/\s/g, "-")
            if (!!f2.asunto)
                f2.asunto = f2.asunto.replace(/\s/g, "-")

            //Directorio con fecha actualizada para archivos editados
            dirOther = 'Files/Temp/' + asunto.replace(/\s/g, "-") + '/' + fc.replace(/-/g,'/') + "/";
            if (!fs.existsSync(dirOther)) {
                fs.mkdirSync(dirOther, { recursive: true });
            }
            //Si cambio el asunto
            if (f2.asunto != asunto || fc!= f2.fc ) {
                //Se rehusa la variable f1 para guardar la direccion anterior de los documentos
                f1 = await doc.find({ idSesion: idSes, idTipoDoc: 4 }, ['urlDocumento'])|| [];
                if (f1.length>0){
                    f1 = f1[0];
                    f1 = f1.urlDocumento;
                    //Se elimina el nombre del archivo para quedar solo con la ruta
                    f1 = f1.split('/');
                    f1.pop();
                    f1 = f1.join('/');
                    f1+='/';

                    let tiposAux; //Guarda todos los tipos menos la Acta Final
                    
                    tiposAux = tipos.filter( tipo => tipo.idTipoDoc!=1);
                    
                    for (let i = 0; i < tiposAux.length; i++)//por cada archivo
                        await fs.promises.rename( f1+cod + tiposAux[i].nombreArchivo, dirOther+cod + tiposAux[i].nombreArchivo );
                    //Elimina los directorios viejos si estan vacios
                    
                    //Se elimina la ultima diagonal
                    f1 = f1.split('/');
                    f1.pop();
                    f1 = f1.join('/'); 

                    for (let i = 0; i < 4; i++){//por cada sub directorio
                        dir = await fs.promises.readdir(f1)
                        
                        if (dir.length == 0 || dir===[ '.DS_Store' ] || dir===[ 'desktop.ini' ] ){
                            await fs.promises.rm(f1, { recursive: true, force: true })
                            f1 = f1.split('/');
                            f1.pop();
                            f1 = f1.join('/');
                        }
                    }
                    //Cada una por cada archivo perecedero
                    for (let i = 0; i < tiposAux.length; i++)
                        doc.editar({ urlDocumento: dirOther + cod + tiposAux[i].nombreArchivo }, { idSesion: idSes, idTipoDoc: tiposAux[i].idTipoDoc });
                }else
                    err.push("Documentos no encontrados");
            }
            
            if (!!files.acta_final) {
                nActa = cod + tipos[0].nombreArchivo;
                try {
                    /*Los archivo por defecto son creados en la raiz de la carpeta files
                    En esta seccion se mueven de ahi a las carpetas generales correspondientes*/
                    await fs.promises.rename(files.acta_final[0].path, dirActa + nActa);
                    await doc.editar({ urlDocumento: dirActa + nActa, fechaSubida: date }, { idTipoDoc: 1, idSesion: idSes })
                } catch (e) {
                    console.log(e);
                }
            }
            if (!!files.convocatoria) {
                nConv = cod + tipos[1].nombreArchivo;

                try {
                    /*Los archivo por defecto son creados en la raiz de la carpeta files
                    En esta seccion se mueven de ahi a las carpetas generales correspondientes*/
                    await fs.promises.rename(files.convocatoria[0].path, dirOther + nConv);
                    await doc.editar({ urlDocumento: dirOther + nConv, fechaSubida: date }, { idTipoDoc: 2, idSesion: idSes })
                } catch (e) {
                    console.log(e);
                }
            }
            if (!!files.carpeta_de_trabajo) {
                nCarp = cod + tipos[2].nombreArchivo;
                try {
                    //Los archivo por defecto son creados en la raiz de la carpeta files
                    //En esta seccion se mueven de ahi a las carpetas generales correspondientes
                    await fs.promises.rename(files.carpeta_de_trabajo[0].path, dirOther + nCarp);
                    await doc.editar({ urlDocumento: dirOther + nCarp, fechaSubida: date }, { idTipoDoc: 3, idSesion: idSes })
                } catch (e) {
                    asdasd
                    console.log(e);
                }
            }
            if (!!files.acta_preliminar) {
                nPrel = cod + tipos[3].nombreArchivo;
                try {
                    /*Los archivo por defecto son creados en la raiz de la carpeta files
                    //En esta seccion se mueven de ahi a las carpetas generales correspondientes*/
                    await fs.promises.rename(files.acta_preliminar[0].path, dirOther + nPrel);
                    await doc.editar({ urlDocumento: dirOther + nPrel, fechaSubida: date }, { idTipoDoc: 4, idSesion: idSes })
                } catch (e) {
                    console.log(e);
                }
            }

            //se edita la sesion
            await ses.editar({ asunto: asunto, fechaInicio: fi, fechaCierre: fc, }, { idSesion: idSes });
        }
        return err;
    }

    archivar = async (idSes) => {
        let err = [];// Variable que almacena los errores contemplados en el proceso

        //NOMBRE DE LOS ARCHIVOS Y DIRECTORIOS A ELIMINAR
        let Files,dir,dirAux;

        let idFile //Variable auxiliar para la eliminación de las observaciones

        Files = await doc.find({ idSesion: idSes })|| [];
        console.log(Files);
        if (Files.length>1){
            Files = Files.filter( File => File.idTipoDoc != 1);
        
            for(let i = 0 ; i< Files.length ; i++)
                Files[i] = Files[i].urlDocumento; 

            //Se obtiene el directorio a partir de un archivo con su ruta
            dir = Files[0];
            //Se quita el nombre del archivo
            dir = dir.split('/');
            dir.pop();
            dir = dir.join('/');
            
            //Se eliminan los archivos
            Files.forEach( async(file)=>{
                try{
                    //Borrado fisico
                    await fs.promises.unlink(file);
                    
                    /*
                    Borrado de observaciones
                        -se obtiene el id del documento
                        -se borra la observacion en base al id
                    */
                    idFile = await doc.find({urlDocumento:file}) || [];
                    if (idFile.length>0)
                    {
                        idFile = idFile[0].idDocumento;
                        await obs.borrar({idDocumento:idFile});
                    }
                    //Borrado de la base de datos
                    await doc.borrar({urlDocumento:file});
                    
                }catch(e){
                    console.log("Error al eliminar: "+file+" : "+e.message);
                }
            });
            //Se elimina el directorio
            for (let i = 0; i < 4; i++){//por cada sub directorio
                dirAux = await fs.promises.readdir(dir)
                
                if (dirAux.length == 0 || dirAux===[ '.DS_Store' ] || dirAux===[ 'desktop.ini' ] ){
                    await fs.promises.rm(dir, { recursive: true, force: true })
                    dir = dir.split('/');
                    dir.pop();
                    dir = dir.join('/');
                }
            }
            //Se marca la sesion como archivada
            if (await ses.borrarS({idSesion:idSes}) == false  )
                err.push("Error al archivar la sesion");
        }
        else
        {
            
            err.push("No se encontraron archivos asociados a esta sesión");
        }
        return err;
    }
}

const sesionO = new sesionC();

module.exports = sesionO;