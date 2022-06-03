var express = require('express');
const res = require('express/lib/response');
var router = express.Router();
const ctrl = require("../controller/usuarioC");
const usuarioC = new ctrl();

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
      res.render('other/msg',{head:'Error 403',body:'Solo un administrador puede ver esta pagina',dir:'/',accept:'Volver'});
    }
  }
});

router.get('/',async(req,res)=>{ //index
  let hash = req.signedCookies["data"];
  let users;
  let isAdmin = await usuarioC.adminCheck(hash);
  isAdmin = isAdmin[0];
  if (isAdmin){
    users = await usuarioC.ver();
    res.render('user/index',{users:users});
  }else
    res.render('other/msg',{head:'Error 403',body:'Solo un administrador puede ver esta pagina',dir:'/',accept:'Volver'});
});


///Falta refactorizar para abajo
router.get('/editar/:id',async(req,res)=>{ //Editar usuario
  let hash = req.signedCookies["data"];
  let usrData;
  let isAdmin = await usuarioC.adminCheck(hash);
  isAdmin = isAdmin[0];

  if (isAdmin){
    usrData = await usuarioC.ver(hash,req.params.id); //Obtiene los datos del usuario del controlador
    if (usrData!= undefined)
      res.render('user/editar',{usr:usrData});
    else
      res.render('other/msg',{head:'Error 404',body:'Usuario no encontrado',dir:'/',accept:'Volver'});
  }else
    res.render('other/msg',{head:'Error 403',body:'Solo un administrador puede ver esta pagina',dir:'/',accept:'Volver'});

  
});

router.get('/salir',async(req,res)=>{ 
  console.log("salir");
  res.clearCookie('data');
  res.redirect("/");
});

//-------------------------------------POST-------------------------------------

router.post('/reg',async (req,res)=>{
  let {nom,pat,mat,user,pass,rpass,tipoUsuario} = req.body;
  //let hash = req.signedCookies["data"];
  let err = await usuarioC.crear(nom,pat,mat,user,pass,rpass,parseInt(tipoUsuario));
  console.log(err);
  if (err.length > 0)
    res.render('user/signin',{err:err});
  else
    res.render('other/msg',{head:'Exito',body:'Usuario registrado satisfactoriamente',dir:'/',accept:'Aceptar'});
});

router.post('/login',async(req,res)=>{
  let {user,pass} = req.body;
  let token = await usuarioC.login(user,pass);
  console.log(token);
  if (token === undefined)
    res.render('user/login',{err:"usuario o contraseña incorrectos"});
  else{
    res.cookie('data', token, {signed: true});
    res.redirect('/');
  }
});

router.post('/borrar',async(req,res)=>{
  let hash = req.signedCookies["data"];
  let id = req.body.idUsuario;
  let err = await usuarioC.borrar(hash,id);
  if (err!=''){
      err = err.split('-');
      res.render('other/msg',{head:err[0],body:err[1],dir:'/',accept:'Volver'});
    }else
      res.render('other/msg',{head:'Exito',body:'Usuario borrado satisfactoriamente',dir:'/',accept:'Aceptar'});
});

router.post('/editar',async (req,res)=>{
  let {nom,pat,mat,user,pass,rpass,tipoUsuario,idUsuario} = req.body;
  let hash = req.signedCookies["data"];
  let err = usuarioC.editar(nom,pat,mat,user,pass,rpass,parseInt(tipoUsuario),idUsuario);
  if (err.length > 0)
    res.render('user/signin',{err:err});
  else
    res.render('other/msg',{head:'Exito',body:'Usuario modificado satisfactoriamente',dir:'/usuario',accept:'Aceptar'});
});


module.exports = router;
