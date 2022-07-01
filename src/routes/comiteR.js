var express = require('express');
var router = express.Router();
var com = require("../controller/comiteC");
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
    let token = req.signedCookies["data"];
    let param = req.query.param;
    let comites = undefined;
    if (param ==='')
      param = undefined;
    if (await com.adminCheck(token)){
      comites = await com.ver(undefined,undefined,param); 
      res.render("comite/index",{comites:comites,borrados:false});
    }
    else{
      res.render('other/msg',{head:'Error 403',body:'Solo un administrador puede ver esta pagina',dir:'/',accept:'Volver'});
    }
});

router.get('/restaurar', async(req, res, next)=> {

  let token = req.signedCookies["data"];
  let param = req.query.param;
    if (param ==='')
      param = undefined;
  if (await com.adminCheck(token)){
    let comites = await com.ver(undefined,true,param); 
    res.render("comite/index",{comites:comites,borrados:true});
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
  let hash = req.signedCookies["data"]
  let comite; //el comite a editar
  let usuarios; //lista de todos los usuarios
  let miembros;
  let isAdmin;
  let idAdmin;
  let {id} = req.params; //Id del comite
  id = parseInt(id);
  

  isAdmin = await com.adminCheck(hash);
  idAdmin = isAdmin[1].idUsuario;
  isAdmin = isAdmin[0];

  if (isAdmin===true && idAdmin!= undefined){
    comite = await com.ver(id);
    miembros = await com.verMiembros(id);
    usuarios = await com.verUsuarios(id); 

    if (miembros!= undefined)
      miembros = JSON.stringify(miembros);
    else
      miembros = '';
    
    if (usuarios!= undefined)
      usuarios = JSON.stringify(usuarios);
    else
      usuarios = '';
    
    if (comite!==undefined)
      res.render("comite/editar",{comite,miembros,usuarios});
    else
      res.render("other/msg",{head:'Error 404',body:'Pagina no encontrada',dir:'/comite',accept:'Volver'});  
  }
  else{
    res.render('other/msg',{head:'Error 403',body:'Solo un administrador puede ver esta pagina',dir:'/',accept:'Volver'});
  }
});

router.get('/ver/:id', async(req, res, next)=> {
  let hash = req.signedCookies["data"];
  let id = req.params.id;
  let comite,miembros;
  
  let isAdmin = await com.adminCheck(hash);
  let idAdmin = undefined;
  if (isAdmin[1]!= undefined)
    idAdmin = isAdmin[1].idUsuario;
  isAdmin = isAdmin[0];

  if (isAdmin === true && idAdmin !== undefined)
  {
      comite = await com.ver(id);
      if (comite!= undefined)
      {
        comite = comite.comite;
        miembros = await com.verMiembros(id);
        res.render("comite/ver",{comite,miembros})
      }
      else
        res.render("other/msg",{head:'Error 404',body:'Pagina no encontrada',dir:'/comite',accept:'Volver'});  
  }else{
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
  let hash = req.signedCookies["data"];
  let {idComite,comite,miembros} = req.body;
  let ok;

  let isAdmin = await com.adminCheck(hash);
  let idAdmin = undefined;
  if (isAdmin[1]!= undefined)
    idAdmin = isAdmin[1].idUsuario;
  isAdmin = isAdmin[0];

  if (isAdmin===true && idAdmin!==undefined){//si es admin
      ok = await com.editar(parseInt(idComite),comite,miembros);
      if (ok){ //y la edicion sale bien
        res.send({message:"Se aplicaron los cambios correctamente"});
      }else{
        res.send({message:"Ocurrio un error al realizar los cambios"});
      }
  }
  else{
    res.send({message:"Solo un administrador puede realizar cambios en este apartado"});
  }
});

router.post('/borrar', async (req,res) =>{
  let hash = req.signedCookies["data"];
  let id = req.body.idComite;
  let ok;

  let isAdmin = await com.adminCheck(hash);
  let idAdmin = undefined;
  if (isAdmin[1]!= undefined)
    idAdmin = isAdmin[1].idUsuario;
  isAdmin = isAdmin[0];

  if (isAdmin===true && idAdmin!==undefined){//si es admin
      ok = await com.borrar(id);
      if (ok) //y la eliminacion sale bien
        res.render('other/msg',{head:'Exito',body:'Comité borrado satisfactoriamente',dir:'/comite',accept:'Aceptar'});
      else
        res.render('other/msg',{head:'Error 404',body:'Comité no encontrado',dir:'/comite',accept:'Aceptar'});
  }
  else
    res.render('other/msg',{head:"Error 403",body:"Es necesario ser administrador para realizar esta accion",dir:'/',accept:'Volver'});

});

router.post('/restaurar', async(req, res, next)=> {
  let hash = req.signedCookies["data"];
  let id = req.body.idComite;
  let ok;

  let isAdmin = await com.adminCheck(hash);
  let idAdmin = undefined;
  if (isAdmin[1]!= undefined)
    idAdmin = isAdmin[1].idUsuario;
  isAdmin = isAdmin[0];

  if (isAdmin===true && idAdmin!==undefined){//si es admin
      ok = await com.restaurar(id);
      if (ok) //y la restauracion sale bien
        res.render('other/msg',{head:'Exito',body:'Comité restaurado satisfactoriamente',dir:'/comite',accept:'Aceptar'});
      else
        res.render('other/msg',{head:'Error 404',body:'Comité no encontrado',dir:'/comite',accept:'Aceptar'});
  }
  else
    res.render('other/msg',{head:"Error 403",body:"Es necesario ser administrador para realizar esta accion",dir:'/',accept:'Volver'});
});
 
module.exports = router;
