var express = require('express');
var router = express.Router();
var doc = require("../controller/documentoC");
var path = require('path');



/* 
Las sesiones son ejercisios en los cuales se discuten ciertos temas y se
realizan acuerdos, solo pueden vizualisarlas los miembros del comite que las creo

Solo pueden ser creadas y editadas por el responsable del comite que las creo

Rutas disponibles
-crear (metodo post)
-editar (metodo put)
-consultar (metodo get)

*/
//Root
// 1C/1C.15/1C.15.2/1C15.2.1/COMECyT.1C.15.2.1.Acta.pdf
// http://localhost:3000/Files/Temp/asdsd/2022/6/1/COMECyT.1C.15.2.1.CarpetaDeTrabajo.pdf

router.get('/:root/:par1/:par2/:par3/:par4/:file', async (req, res )=> {
  let hash = req.signedCookies["data"]; //Datos de usuario
  let docDir = undefined;
  let fullPath = undefined;

  //Datos del documento

  fullPath = path.join(__dirname,'../..');
  docDir = '/Files/'+req.params.root+'/';
  docDir += req.params.par1+'/';
  docDir += req.params.par2+'/';
  docDir += req.params.par3+'/';
  docDir += req.params.par4+'/';
  docDir += req.params.file;

  fullPath = path.join(fullPath,docDir);

  //Datos del usuario
  
  usuario = doc.jwtDec(hash);

  if (!!usuario){
    if (await doc.auth(usuario.idUsuario,docDir))
      res.sendFile(fullPath,(err)=>{
        if (err){
          console.log(err)
          res.render('other/msg',{head:'Error 404',body:'Archivo no encontrado',dir:'',accept:''});
        }
        else
          console.log("Servido el archivo : "+fullPath+" a el usuario "+usuario.nombre);
      });
    else
      res.render('other/msg',{head:'Error 403',body:'Acceso denegado',dir:'',accept:''});
  }else
    res.render('other/msg',{head:'Error 403',body:'Acceso denegado',dir:'',accept:''});

  
});




module.exports = router;
