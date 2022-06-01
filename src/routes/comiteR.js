var express = require('express');
var router = express.Router();

var comiteC = require("../controller/comiteC");
var com = new comiteC();
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

    let token = req.signedCookies["data"]
    if (await com.adminCheck(token)){
      let comites = await com.ver(); 
      res.render("comite/index",{comites:comites});
    }
    else{
      res.render('other/msg',{head:'Error 403',body:'Solo un administrador puede ver esta pagina',dir:'/',accept:'Volver'});
    }
});

router.get('/crear', async (req,res) =>{
  let token = req.signedCookies["data"];
  if (await com.adminCheck(token))
    res.render("comite/crear");
  else
    res.render('other/msg',{head:'Error 403',body:'Solo un administrador puede ver esta pagina',dir:'/',accept:'Volver'});
});

router.get('/editar/:id', async(req, res, next)=> {
  let token = req.signedCookies["data"]
  if (await com.adminCheck(token)){
    let {id} = req.params;
    let comite;
  
    id = parseInt(id);
    comite = await com.ver(id);
    if (comite!==undefined)
      res.render("comite/editar",{comite});
    else
      res.render("other/msg",{head:'Error 404',body:'Pagina no encontrada',dir:'/comite',accept:'Volver'});  
  }
  else{
    res.render('other/msg',{head:'Error 403',body:'Solo un administrador puede ver esta pagina',dir:'/',accept:'Volver'});
  }
});

//------------------------------------------------POST---------------------------------------
router.post('/crear', async(req, res, next)=> {
  let token = req.signedCookies["data"]
  if (await com.adminCheck(token)){
    let {comite} = req.body;
    let err = await com.crear(comite);
    if (err===undefined)
      res.render("other/msg",{head:'Error 500',body:'Ocurrio un error interno en el servidor intentelo mas tarde',dir:'/comite',accept:'Volver'});
    if (err.length>0)
      res.render("comite/crear",{err});
    else
      res.render("other/msg",{head:'Exito',body:'Comite registrado exitosamente',dir:'/comite',accept:'Volver'});  
  }
  else{
    res.render('other/msg',{head:'Error 403',body:'Solo un administrador puede ver esta pagina',dir:'/',accept:'Volver'});
  }
  
});

router.post('/editar', async(req, res, next)=> {
  let token = req.signedCookies["data"]
  if (await com.adminCheck(token)){
    let {idComite,comite} = req.body;
    idComite = parseInt(idComite);
  
    let err = await com.editar(comite,idComite);
    if (err===undefined)
      res.render("other/msg",{head:'Error 500',body:'Ocurrio un error interno en el servidor intentelo mas tarde',dir:'/comite',accept:'Volver'});
    if (err.length>0)
      res.render("comite/editar",{err:err, comite:{comite:comite,idComite:idComite}});
    else
      res.render("other/msg",{head:'Exito',body:'Comite modificado exitosamente',dir:'/comite',accept:'Volver'});  
  }
  else{
    res.render('other/msg',{head:'Error 403',body:'Solo un administrador puede ver esta pagina',dir:'/',accept:'Volver'});
  }

  
});

router.post('/borrar', async (req,res) =>{
  res.send('comite');
});
 
module.exports = router;
