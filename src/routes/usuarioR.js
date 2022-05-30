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

router.get('/login',(req,res)=>{ //Ingresar al sistema
    res.render('user/login');
});

router.get('/reg',(req,res)=>{ //Nuevo usuario
    res.render('user/signin');
});

router.get('/',async(req,res)=>{ //index
  let hash = req.signedCookies["data"];
  let users;
  let isAdmin = await usuarioC.adminCheck(hash);
  isAdmin = isAdmin[0];
  if (isAdmin){
    users = await usuarioC.index(hash);
    res.render('user/index',{users:users});
  }else
    res.render('other/msg',{head:'Error 403',body:'Solo un administrador puede ver esta pagina',dir:'/',accept:'Volver'});
});

router.get('/editar/:id',async(req,res)=>{ //Editar usuario
  let hash = req.signedCookies["data"];
  let usrData = await usuarioC.ver(hash,req.params.id); //Obtiene los datos del usuario del controlador

  if (usrData!= undefined)
    res.render('user/editar',{usr:usrData});
  else
    res.render('other/msg',{head:'Error 404',body:'Usuario no encontrado',dir:'/',accept:'Volver'});
});

//-------------------------------------POST-------------------------------------

router.post('/reg',async (req,res)=>{
  let {nom,pat,mat,user,pass,rpass,tipoUsuario} = req.body;
  let hash = req.signedCookies["data"];
  let err = usuarioC.crear(hash,nom,pat,mat,user,pass,rpass,tipoUsuario);
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

router.post('/borrar/:id',async(req,res)=>{
  let hash = req.signedCookies("data");
  let id = req.params.id;
  let err = await usuarioC.borrar(hash,id);
  if (err.length>0){
    err[0] = err[0].split('-');
    res.render('other/msg',{head:err[0],body:err[1],dir:'/',accept:'Volver'});
  }else
    res.render('other/msg',{head:'Exito',body:'Usuario borrado satisfactoriamente',dir:'/',accept:'Aceptar'});

});

router.post('/editar',async (req,res)=>{
  let {nom,pat,mat,user,pass,rpass,tipoUsuario,idUsuario} = req.body;
  let hash = req.signedCookies["data"];
  let err = usuarioC.editar(hash,nom,pat,mat,user,pass,rpass,tipoUsuario,idUsuario);
  if (err.length > 0)
    res.render('user/signin',{err:err});
  else
    res.render('other/msg',{head:'Exito',body:'Usuario modificado satisfactoriamente',dir:'/usuario',accept:'Aceptar'});
});





module.exports = router;
