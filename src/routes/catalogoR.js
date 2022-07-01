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
    let {param,type,fi,fc} = req.query;
    let sesiones = undefined;
    if (param ==='')
      param = undefined;
    if (await ses.adminCheck(hash)){
      sesiones = await ses.buscarAdmin(param,type,fi,fc);
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
    //sesion = await ses.verAdmin(idS);
    sesion = [{
      idSesion: 1,
      asunto: 'asddsqe',
      fechaInicio: '2020-05-12',
      fechaCierre: '2020-06-12',
      numSesion: 1,
      valorDocumental: [ 1, 1, 1 ],
      enTram: 0,
      enConc: 0,
      vig: 0,
      valHist: false,
      dispDocumental: [ 1, 1, 1 ],
      clasInfo: [ 1, 1, ],
      obs: 'aksdjk lasjdklasd  jkladjkldk ljklasjdl',
      idUsuario: 2,
      idComite: 1,
      borrado: 0,
      comite: 'Comité-de-Ética',
      codigo: '1C.15.1.1'
    }];
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
    
});

 
module.exports = router;
