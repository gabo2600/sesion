var express = require('express');
var router = express.Router();
var ses = require("../controller/sesionC");
/*

Los comites son organismos compuestos de varios integrantes y un responsable,
los integrantes son usuarios de tipo(0) y los responsables de tipo(1)

la unica persona capaz de modificar los comites es el usuario Root de tipo (2)

Rutas disponibles
-crear (metodo post)
-editar (metodo put)
-consultar
*/
router.get('/', async(req, res, next)=> {
    let hash = req.signedCookies["data"];
    let sesDate;//Variable auxiliar que guarda la fecha de expiracion
    let expDate; //Fecha de hoy
    let {param,type,fi,fc} = req.query;
    let sesiones = [];

    expDate = new Date();
    expDate.setFullYear(expDate.getFullYear()-5);

    if (param ==='')
      param = undefined;
    if (await ses.adminCheck(hash)){
      sesiones = await ses.buscarAdmin(param,type,fi,fc);
      sesiones.forEach(sesion => {
        sesDate = new Date(Date.parse(sesion.fechaCierre));
        sesDate.setDate(sesDate.getDate()+1);
        if (sesDate<=expDate)
          sesion.expired=true;
        else
          sesion.expired=false;
      });
      res.render("catalogo/index",{sesiones:sesiones});
    }
    else{
      res.render('other/msg',{head:'Error 403',body:'Solo un administrador puede ver esta pagina',dir:'/',accept:'Volver'});
    }
});

router.get('/editar/:idS', async(req, res, next)=> {
  let hash = req.signedCookies["data"];
  let {idS} = req.params;
  let sesion = undefined;

  if (await ses.adminCheck(hash)){
    sesion = await ses.verAdmin(idS);
    if (!!sesion)
      res.render("catalogo/editar",{sesion:sesion[0]}); 
    else
      res.render('other/msg',{head:'Error 404',body:'Sesion no encontrada',dir:'/catalogo',accept:'Volver'});
  }
  else{
    res.render('other/msg',{head:'Error 403',body:'Solo un administrador puede ver esta pagina',dir:'/',accept:'Volver'});
  }

});

router.post('/', async(req, res, next)=> {
  let {
  idSesion,    //Id de la sesion
  valorDocumental1, //Administrativo
  valorDocumental2, //LEgal
  valorDocumental3, //Contable
  //Plazo de conservación
  enT, //En tramite
  enC, //En concentración
  valHist, //Cuenta con valor historico
  //Dispocision documental
  dispDoc1, //Muestreo
  dispDoc2, //Conservar
  dispDoc3, //Eliminar
  //Clasificación de la información
  clas1, //Confidencial
  clas2, //Reservada
  obs //Observaciones del administrador acerca de la sesion
  } = req.body; //Parametros de la petición
  let response = undefined;// Respuesta de la funcion editar del controlador

  let hash = req.signedCookies["data"]; //Datos del usuario

  if (await ses.adminCheck(hash)){
    sesion = await ses.editarAdmin(  idSesion,valorDocumental1,valorDocumental2,valorDocumental3,enT,enC,valHist,dispDoc1,dispDoc2,dispDoc3,clas1,clas2,obs);
    if (!!sesion)
      res.render('other/msg',{head:'Hecho',body:'Información actualizada exitosamente',dir:'/catalogo',accept:'Volver'});
    else
      res.render('other/msg',{head:'Error 500',body:'Hubo un error al procesar su solicitud',dir:'/catalogo',accept:'Volver'});
  }
  else{
    res.render('other/msg',{head:'Error 403',body:'Solo un administrador puede ver esta pagina',dir:'/',accept:'Volver'});
  }
});

 
module.exports = router;
