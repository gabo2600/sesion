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

router.get('/login',(req,res)=>{
    res.render('user/login');
});

router.get('/reg',(req,res)=>{
    res.render('user/signin');
});

//-------------------------------------POST-------------------------------------

router.post('/reg',(req,res)=>{
  let {nom,pat,mat,user,pass,rpass} = req.body;
  let err = usuarioC.crear(nom,pat,mat,user,pass,rpass);
  if (err.length > 0)
    res.render('user/signin',{err:err});
  else
    res.render('other/msg',{head:'Exito',body:'Usuario registrado satisfactoriamente',dir:'/',accept:'Aceptar'});
});

router.post('/login',(req,res)=>{
  let {user,pass} = req.body;
  let token = usuarioC.login(user,pass);
  if (token === undefined)
    res.render('user/login',{err:"usuario o contraseña incorrectos"});
  else
    res.render('other/msg',{head:'Exito',body:'Usuario inicio sesion',dir:'/',accept:'Aceptar'});

});




module.exports = router;
