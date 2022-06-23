const async = require("hbs/lib/async");
const model = require("../model/model");
const ses = new model("sesion");
const com = new model("comite");
const doc = new model("documento");
const controller = require("./controller");
const val = require('validator');
var fs = require("fs");
const { createCipheriv } = require("crypto");

 
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
            let comite = await com.find({idComite:idComite},undefined,['comite']);

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
                var dirActa ='src/public/Files/COMECyT/1C/1C.15/1C.15.'+idComite+"/"+"1C15."+idComite+"."+numSesion+"/";
                var dirOther = 'src/public/Files/Temp/'+asunto+'/'+d.getFullYear()+'/'+d.getMonth()+'/'+d.getDate();
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
                    await fs.promises.rename(files.carpeta_de_trabajo[0].path, dirOther+nPrel);
                    await fs.promises.rename(files.acta_preliminar[0].path, dirOther+nCarp);
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
                return await ses.findCustom("SELECT idSesion,numSesion,asunto,fechaInicio,fechaCierre,nombre,apellidoP,apellidoM FROM sesion INNER JOIN usuario ON sesion.idUsuario=usuario.idUsuario WHERE idComite="+idComite);
            }
            else{
                return await ses.find({idSesion:idSesion},undefined,['asunto','numSesion','fechaInicio','fechaCierre']);
            }
        }
    }

    verDoc = async(idSesion=undefined)=>{
        if (idSesion!=undefined)
        {
            idSesion = parseInt(idSesion);
            return await doc.findCustom("SELECT tipoDocumento,idDocumento,fechaSubida FROM documento WHERE idSesion="+idSesion);
        }
    }

    editar = async()=>{
        
    }

}

const sesionO = new sesionC();

module.exports = sesionO;
