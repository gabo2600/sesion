const async = require("hbs/lib/async");
const model = require("../model/model");
const ses = new model("sesion");
const com = new model("comite");
const doc = new model("documento");
const controller = require("./controller");
const val = require('validator');
var fs = require("fs");

 
class sesionC extends controller{
    constructor(){
        super();
    }

    #intToBin = (x,isEdit=false)=>{ //Funcion privada para convertir valores numericos a arreglos donde 0 es ' ' y uno es 'X'
        let res = undefined;
        switch(x)
        {
            case 0:
                if (isEdit)
                    res = [0,0,0];
                else
                    res = [' ',' ',' '];
                break;
            case 1:
                if (isEdit)
                    res = [1,0,0];
                else
                    res = ['X',' ',' '];
                break;
            case 2:
                if (isEdit)
                    res = [0,1,0];
                else
                    res = [' ','X',' '];
                break;
            case 3:
                if (isEdit)
                    res = [1,1,0];
                else
                    res = ['X','X',' '];
                break;
            case 4:
                if (isEdit)
                    res = [0,0,1];
                else
                    res = [' ',' ','X'];
                break;
            case 5:
                if (isEdit)
                    res = [1,0,1];
                else
                    res = ['X',' ','X'];
                break;
            case 6:
                if (isEdit)
                    res = [0,1,1];
                else
                    res = [' ','X','X'];
                break;
            case 7:
                if (isEdit)
                    res = [1,1,1];
                else
                    res = ['X','X','X'];
                break;
        }
        return res;
    }
    
    #binToInt = (x,y,z)=>{
        let r = 0;
        if (!!x)
            r+=1;
        if (!!y)
            r+=2;
        if (!!z)
            r+=4;
        return r;
    }

    verComites = async(hash)=>{ //retorna objeto con comites o un undefined
        let data = undefined;
        let res = undefined;
        if (hash!= undefined)
        {
            data = this.jwtDec(hash);
            if (data!== undefined)
            {   
                res =  await com.findJoint({comite:'idComite',ruc:'idComite'},{idUsuario:data.idUsuario,'comite.borrado':0});
                if (!!res)
                    for(let i = 0 ; i<res.length ; i++)
                        res[i].comite =  res[i].comite.replace(/-/g,' ');
                return res;
            }
                return undefined
        }
        else
            return undefined; 
    }

    crear = async (asunto,fi,fc,idComite,idUsuario,files)=>{
        let err = [];
        let d = new Date();
        let date = d.getFullYear()+'-'+d.getMonth()+'-'+d.getDate();

        //Validación
        if (!val.isAlphanumeric(asunto, ['es-ES'],{ignore:' ,.-_'}))
            err.push("El asunto no puede contener caracteres especiales");
        if (fi>fc)
            err.push("La fecha de inicio es posterior a la de cierre");

        idComite = parseInt(idComite);
        idUsuario = parseInt(idUsuario);

        //Si los datos son validos
        if (err.length<=0){
            let fileDirs = [] //Variable que almacena directorio final de los archivos

            //se crea una nueva sesion
            let numSesion = await ses.findCustom("SELECT * FROM sesion WHERE idComite="+idComite+" ORDER BY numSesion DESC");
            //se establece el numero de sesion en base al comite y sus sesiones anteriores
            if (numSesion== undefined)
                numSesion = 1;
            else
                numSesion = numSesion[0].numSesion+1;

            let idSesion = await ses.crear({asunto:asunto,fechaInicio:fi,fechaCierre:fc,numSesion:numSesion,idUsuario:idUsuario,idComite:idComite});
            //se obtiene el comite para despues sacar el nombre para las carpetas
            let comite = await com.find({idComite:idComite,borrado:0},['comite']);

            if (comite!= undefined){
                comite = comite[0];
                comite = comite.comite; 
                /*
                Se ubican los archivos en su carpeta correspondiente
                -Acta final (Permanente) 
                    COMECyT (Fondo) 
                            └1C (Secciòn)
                                    └1C.15    (serie)
                                        └1C.15.1 Nombre del comité(indice del comite)
                                                        └1C.15.1.1(asunto)
                                                                     	└acta-final.pdf
            
                            1C         15          1           1
                            INMUTABLE  INMUTABLE    idComite    Numero de sesion() COMECyT1C.15.1.1.pdf                                                   

                    comite1
                    expediente1
                    sesion1
                    /COMECyT/1C/1C.15/1C.15.1/1C.15.1/COMECyT1C.15.1.1.pdf
                    clasificacion
                    COMECyT1C.15.1.1.pdf

                            Convocatoria-carpeta de trabajo-acta-preeliminar
                                    Titulo(Expediente)
                                             └AÑO     
                                                └MES
                                                    └DIA
                                                      └Pagina
                                                            └ COMECyT1C.15.1.1.convocatoria.pdf  
                                                            └ COMECyT1C.15.1.1.carpeta_de_trabajo.pdf  
                                                            └ COMECyT1C.15.1.1.acta_preliminar.pdf                                          
*/              
                //Directorios
                var dirActa ='Files/COMECyT/1C/1C.15/1C.15.'+idComite+"/"+"1C15."+idComite+"."+numSesion+"/";
                var dirOther = 'Files/Temp/'+asunto.replace(/\s/g , "-")+'/'+d.getFullYear()+'/'+d.getMonth()+'/'+d.getDate()+"/";
                if (!fs.existsSync(dirActa)){
                    fs.mkdirSync(dirActa, { recursive: true });
                }
                if (!fs.existsSync(dirOther)){
                    fs.mkdirSync(dirOther, { recursive: true });
                }
                //nombres de los archivos
                var nActa = "COMECyT.1C.15."+idComite+"."+numSesion+".Acta.pdf";
                var nConv = "COMECyT.1C.15."+idComite+"."+numSesion+".Convocatoria.pdf";
                var nPrel = "COMECyT.1C.15."+idComite+"."+numSesion+".ActaPreliminar.pdf";
                var nCarp = "COMECyT.1C.15."+idComite+"."+numSesion+".CarpetaDeTrabajo.pdf";
                
                try{
                    await fs.promises.rename(files.acta_final[0].path, dirActa+nActa);
                    await fs.promises.rename(files.convocatoria[0].path, dirOther+nConv);
                    await fs.promises.rename(files.carpeta_de_trabajo[0].path, dirOther+nCarp);
                    await fs.promises.rename(files.acta_preliminar[0].path, dirOther+nPrel);
                    fileDirs.push([1,dirActa+nActa]);
                    fileDirs.push([2,dirOther+nConv]);
                    fileDirs.push([3,dirOther+nCarp]);
                    fileDirs.push([4,dirOther+nPrel]);
                }catch(e){
                    console.log(e);
                }
                if (fileDirs.length>0)
                    for(let i = 0 ; i< fileDirs.length ; i++)
                    {
                        doc.crear({tipoDocumento:fileDirs[i][0],urlDocumento:fileDirs[i][1].split("src/public/").pop(),fechaSubida:date,idSesion:idSesion})
                    }
                else{
                    ses.borrar({idSesion:idSesion});
                    err.push("Erorr al subir documentos");
                }
            }
            else
                err.push("Comite no disponible");
        }
        return err;
    }

    ver = async(idComite,idSesion=undefined)=>{
        if (idComite!=undefined)
        {
            idComite = parseInt(idComite);
            if (idSesion === undefined){
                return await ses.findCustom("SELECT idSesion,numSesion,asunto,fechaInicio,fechaCierre,nombre,apellidoP,apellidoM FROM sesion INNER JOIN usuario ON sesion.idUsuario=usuario.idUsuario WHERE sesion.borrado=0 AND usuario.borrado=0 AND idComite="+idComite);
            }
            else{
                return await ses.find({idSesion:idSesion,borrado:0},['asunto','numSesion','fechaInicio','fechaCierre']);
            }
        }
    }

    verAdmin = async(idSes = undefined)=>{
        let res = undefined;
        let i = undefined;
        let baseSql = 'SELECT * FROM (SELECT sesion.*,comite.comite,CONCAT("1C.15.",sesion.idComite,".",sesion.numSesion) as codigo FROM sesion INNER JOIN comite ON sesion.idComite=comite.idComite) as t1 WHERE idSesion='+idSes;
        res =  await ses.findCustom(baseSql);
        //Los Campos de valor documental, dispDocumental y clasInfo son enteros
        //A continuacion se convertiran en arreglos binarios
        if (!!res)


            for(let i = 0 ; i< res.length; i++)
            {
                res[i].valorDocumental = this.#intToBin(res[i].valorDocumental,true);
                res[i].dispDocumental = this.#intToBin(res[i].dispDocumental,true);
                res[i].clasInfo = this.#intToBin(res[i].clasInfo,true);
                
                if (res[i].valHist==1)
                    res[i].valHist=true;
                else
                    res[i].valHist=false;
                
                res[i].comite =  res[i].comite.replace(/-/g,' ');
            }
        return res;
    }

    buscarAdmin = async(param,type,fi,fc)=>{

        let res = undefined;
        let i = undefined;
        let baseSql = 'SELECT * FROM (SELECT sesion.*,comite.comite,CONCAT("1C.15.",sesion.idComite,".",sesion.numSesion) as codigo FROM sesion INNER JOIN comite ON sesion.idComite=comite.idComite) as t1'
        
        type = parseInt(type);
        
        if (!!param){

            param = param.split(' '); //Se separan los terminos a buscar
            
            baseSql+=" WHERE ";

            switch(type){
                case 1: //Todo
                    for(i = 0 ; i< param.length ; i++){
                        if (i != 0 )
                            baseSql+=' AND ';
                        baseSql+= 'comite LIKE "%'+param[i]+'%" OR codigo LIKE "%'+param[i]+'%"';
                    }
                    break;
                case 2: //Comite
                    for(i = 0 ; i< param.length ; i++){
                        if (i != 0 )
                            baseSql+=' AND ';
                        baseSql+= ' comite LIKE "%'+param[i]+'%"';
                    }
                    break;
                case 3: //Fechas
                    baseSql+= ' "'+fi+'" <= fechaInicio AND "'+fc+'" >= fechaCierre;'
                    break;
                case 4: //Codigo
                    for(i = 0 ; i< param.length ; i++){
                        if (i != 0 )
                            baseSql+=' AND ';
                        baseSql+= ' codigo LIKE "%'+param[i]+'%"';
                    }
                    break;
            }
        }
        res =  await ses.findCustom(baseSql);
        //Los Campos de valor documental, dispDocumental y clasInfo son enteros
        //A continuacion se convertiran en arreglos binarios

        if (!!res)
            for(let i = 0 ; i< res.length; i++)
            {
                res[i].valorDocumental = this.#intToBin(res[i].valorDocumental);
                res[i].dispDocumental = this.#intToBin(res[i].dispDocumental);
                res[i].clasInfo = this.#intToBin(res[i].clasInfo);
                res[i].vig = res[i].enTram + res[i].enConc;
                
                if (res[i].valHist==1)
                    res[i].valHist='X'
                else
                    res[i].valHist=' ';
                
                res[i].comite =  res[i].comite.replace(/-/g,' ');
            }

        return res;
    }
    
    verDoc = async(idSesion=undefined)=>{
        if (idSesion!=undefined)
        {
            idSesion = parseInt(idSesion);
            return await doc.find({idSesion:idSesion},['tipoDocumento','idDocumento','fechaSubida']);
        }
    }

    editarAdmin = async(  idSesion,valorDocumental1,valorDocumental2,valorDocumental3,enT,enC,valHist,dispDoc1,dispDoc2,dispDoc3,clas1,clas2,obs)=>{
        let param = {
            valorDocumental:this.#binToInt( //Se toman los valores de las casillas y se combieten a un entero
                valorDocumental1,
                valorDocumental2,
                valorDocumental3
            ),
            enTram:enT,
            enConc:enC,
            valHist:(valHist||0),
            dispDocumental:this.#binToInt( //Se toman los valores de las casillas y se combieten a un entero
                dispDoc1,
                dispDoc2,
                dispDoc3
            ),
            clasInfo:this.#binToInt(clas1, //Se toman los valores de las casillas y se combieten a un entero
                clas2
            ),
            obs:obs
        }; //los parametros para el edit
        let response = false;
        if (!!idSesion)
            response = await ses.editar(param,{idSesion:idSesion});
        
        return response;

    }
}

const sesionO = new sesionC();

module.exports = sesionO;
