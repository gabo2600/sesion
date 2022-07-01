var express = require('express');
const res = require('express/lib/response');
var router = express.Router();
const usuarioC = require("../controller/usuarioC");
 
/* Rutas
Son los distintos usuarios del sistema los cuales se dividen en tres categorias
usando como diferenciador el campo tipoUsuario en la bd, los tres tipos de usuario son:
-miembro de un comite (0)
-responsable de un comite (1)
-usuario root (2)

Rutas disponibles
-crear
-editar
-consultar 
-borrar

*/
router.get('/login',async(req,res)=>{ //Ingresar al sistema
  if (await usuarioC.primerUso())
    res.redirect('/usuario/reg');
  else
    res.render('user/login'); 
    
});
 
router.get('/reg',async(req,res)=>{ //Nuevo usuario
  let token = req.signedCookies["data"];
  if (await usuarioC.primerUso())
    res.render('user/signin',{primerUso:true});
  else{
    if (await usuarioC.adminCheck(token)){
      res.render('user/signin',{primerUso:false});
    }
    else{
      res.render('other/msg',{head:'Error 403',body:'Solo un administrador puede ver esta pagina',dir:'/usuario',accept:'Volver'});
    }
  }
});

router.get('/',async(req,res)=>{ //index
  let hash = req.signedCookies["data"];
  let param = req.query.param;
  if (param ==='')
    param = undefined;

  let users;
  let isAdmin = await usuarioC.adminCheck(hash);
  isAdmin = isAdmin[0];
  if (isAdmin){
    users = await usuarioC.ver(undefined,param);
    res.render('user/index',{users:users});
  }else
    res.render('other/msg',{head:'Error 403',body:'Solo un administrador puede ver esta pagina',dir:'/',accept:'Volver'});
});


router.get('/editar/:id',async(req,res)=>{ //Editar usuario
  let hash = req.signedCookies["data"];
  let usrData; 
  let isAdmin = await usuarioC.adminCheck(hash);
  
  isAdmin = isAdmin[0];

  if (isAdmin){
    usrData = await usuarioC.ver(req.params.id); //Obtiene los datos del usuario del controlador
    if (usrData!= undefined)
      res.render('user/editar',{usr:usrData});
    else
      res.render('other/msg',{head:'Error 404',body:'Usuario no encontrado',dir:'/usuario',accept:'Volver'});
  }else
    res.render('other/msg',{head:'Error 403',body:'Solo un administrador puede ver esta pagina',dir:'/usuario',accept:'Volver'});

  
});

router.get('/salir',async(req,res)=>{ 
  res.clearCookie('data');
  res.redirect("/");
});

//-------------------------------------POST-------------------------------------


router.post('/reg',async (req,res)=>{
  let {nom,pat,mat,user,pass,rpass,tipoUsuario} = req.body;
  let hash = req.signedCookies["data"];
  let isAdmin = await usuarioC.adminCheck(hash);
  let err = [];
  isAdmin = isAdmin[0];

  //let hash = req.signedCookies["data"];
  if (isAdmin || await usuarioC.primerUso() ){
      err = await usuarioC.crear(nom,pat,mat,user,pass,rpass,parseInt(tipoUsuario));
    if (err.length > 0)
      res.render('user/signin',{err:err});
    else
      res.render('other/msg',{head:'Exito',body:'Usuario registrado satisfactoriamente',dir:'/',accept:'Aceptar'});
  }else
      res.render('other/msg',{head:'Error 403',body:'Accion no permitida, se requiere ser administrador',dir:'/usuario',accept:'Volver'});
});

router.post('/login',async(req,res)=>{
  let {user,pass} = req.body;
  let token = await usuarioC.login(user,pass);
  if (token === undefined)
    res.render('user/login',{err:["usuario o contraseña incorrectos"]});
  else{
    res.cookie('data', token, {signed: true});
    res.redirect('/');
  }
});

router.post('/borrar',async(req,res)=>{
  let hash = req.signedCookies["data"];
  let id = req.body.idUsuario;
  let ok;

  let isAdmin = await usuarioC.adminCheck(hash);
  let idAdmin = undefined;
  if (isAdmin[1]!= undefined)
    idAdmin = isAdmin[1].idUsuario;
  isAdmin = isAdmin[0];

  if (isAdmin===true && idAdmin!==undefined){//si es admin
    if (idAdmin!=id){//y no se intenta borrar a si mismo
      ok = await usuarioC.borrar(id);
      if (ok) //y la eliminacion sale bien
        res.render('other/msg',{head:'Exito',body:'Usuario borrado satisfactoriamente',dir:'/usuario',accept:'Aceptar'});
      else
        res.render('other/msg',{head:'Error 404',body:'Usuario no encontrado',dir:'/usuario',accept:'Aceptar'});
    }else
      res.render('other/msg',{head:"Error 403",body:"Un administrador no puede borrarse a si mismo",dir:'/usuario',accept:'Volver'});
  }
  else
    res.render('other/msg',{head:"Error 403",body:"Es necesario ser administrador para realizar esta accion",dir:'/usuario',accept:'Volver'});
});

router.post('/editar',async (req,res)=>{
  let {nom,pat,mat,user,pass,rpass,tipoUsuario,idUsuario} = req.body;
  console.log(nom);
  let hash = req.signedCookies["data"];
  let isAdmin = await usuarioC.adminCheck(hash);
  let idAdmin = undefined;
  let err;
  
  if (isAdmin[1]!== undefined)
    idAdmin = isAdmin[1].idUsuario;
  isAdmin = isAdmin[0];

  if (isAdmin === true && idAdmin!= undefined){
    err = await usuarioC.editar(nom,pat,mat,user,pass,rpass,parseInt(tipoUsuario),idUsuario);
    if (err.length > 0)
      res.render('user/editar',{usr:{nombre:nom,apellidoP:pat,apellidoM:mat,user:user,tipoUsuario:parseInt(tipoUsuario),idUsuario:parseInt(idUsuario)},err:err});
    else
      res.render('other/msg',{head:'Exito',body:'Usuario modificado satisfactoriamente',dir:'/usuario',accept:'Aceptar'});
  }
  else
    res.render('other/msg',{head:"Error 403",body:"Es necesario ser administrador para realizar esta accion",dir:'/usuario',accept:'Volver'});
});


module.exports = router;
