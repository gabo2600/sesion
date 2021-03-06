var express = require('express');
var router = express.Router();
var doc = require("../controller/documentoC");
var ses = require("../controller/sesionC");


/* 
Los documentos generados en las distintas sesiones del comite,
son divididos en ...

Rutas disponibles
-consultar (metodo get)
*/



router.get('/:com/:ses/:tipo', async(req, res)=> {
  let hash = req.signedCookies["data"];//datos de la ccokie del usuario...
  let nom = undefined; //Nombre del usuario
  let comites = undefined; //Comites a los que el usuario esta registrado
  let com = undefined; //El comite seleccionado
  let documento = undefined; //Documento seleccionado

  //Documento
  documento = await doc.ver(req.params.com,req.params.ses,req.params.tipo);

  //info de los comites
  comites = await ses.verComites(hash);
  //Si el usuario pertenece a algun comite
  if (!!comites){
    com = comites.filter((comite)=> comite.idComite==req.params.com);
    if (!!com){
      com = com[0];
      //Nombre del usuario
      nom = ses.jwtDec(hash);
      if (nom != undefined)
        nom = nom.nombre;
      else
        nom = "Usuario no enconterado";

      //Si se encontro el documento
      if (documento!= undefined){
        //Observaciones
        documento = documento[0]; 
        res.render("documento(observaciones)/index",{comites:comites,comAct:com,nom:nom,doc:documento,isAdmin:false});
      }else
        res.render('other/msg',{head:"Error 404",body:"Documento no encontrado",dir:"/sesion/ver/"+req.params.com+'/'+req.params.ses,accept:'Volver'});
      //comites,comAct,nombre,rol,   doc(tipoDoc,url) , obs(autor,idObs,obs);
    }
    else
      res.render('other/msg',{head:"Error 403",body:"El usuario no pertenece al comite que emitio el documento seleccionado",dir:"/sesion/ver/"+req.params.com+'/'+req.params.ses,accept:'Volver'});
  }
  else
  {
    let adm = await ses.adminCheck(hash);
    if (adm[0])
    {
      if (documento!= undefined){
        //Observaciones
        documento = documento[0]; 
        res.render("documento(observaciones)/index",{
          doc:documento,
          isAdmin:true
        });
      }else
        res.render('other/msg',{head:"Error 404",body:"Documento no encontrado",dir:"/sesion/ver/"+req.params.com+'/'+req.params.ses,accept:'Volver'});
    }
  }
});

router.get('/:com', async (req, res )=> {
  let sesiones = await ses.ver(req.params.com);
  res.render("sesion/index",{comites:comites,comAct:com,nom:nom,rol:com.esResp,sesiones:sesiones});
});


module.exports = router;
