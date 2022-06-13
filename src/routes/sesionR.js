var express = require('express');
var router = express.Router();

var sesionC = require("../controller/sesionC");
var ses = new sesionC();

/* 
Las sesiones son ejercisios en los cuales se discuten ciertos temas y se
realizan acuerdos, solo pueden vizualisarlas los miembros del comite que las creo

Solo pueden ser creadas y editadas por el responsable del comite que las creo

Rutas disponibles
-crear (metodo post)
-editar (metodo put)
-consultar (metodo get)

*/
router.get('/', async (req, res )=> {
  let hash = req.signedCookies["data"];
  let com = await ses.verComites(hash);
  if (com!= undefined)
    res.redirect("/sesion/"+com[0].comite);
  else
    res.render('other/msg',{head:"El usuario no pertenece a ningun comite",body:"Notifoque al administrador",dir:"/usuario/salir",accept:'Cerrar sesion'});
});


router.get('/:com', async (req, res )=> {
  let hash = req.signedCookies["data"];
  let comites = await ses.verComites(hash);
  
  let rol = comites.filter((comite)=> comite.comite==req.params.com);
  let nom = ses.jwtDec(hash);
  if (nom != undefined)
    nom = nom.nombre;
  else
    nom = "Usuario no enconterado"
  res.render("sesion/index",{comites:comites,comAct:req.params.com,nom:nom,rol:rol[0].esResp});
});

router.get('/:com/crear', async (req, res )=> {
  let hash = req.signedCookies["data"];
  let comites = await ses.verComites(hash);
  
  let rol = comites.filter((comite)=> comite.comite==req.params.com);
  if (rol[0]!= undefined)
    rol = rol[0].esResp;
  else
    rol = 0;

  console.table(rol);
  let nom = ses.jwtDec(hash);
  if (nom != undefined)
    nom = nom.nombre;
  else
    nom = "Usuario no enconterado";

  if (rol)
    res.render("sesion/crear",{comites:comites,comAct:req.params.com,nom:nom,rol:rol,action:"/sesion/"+req.params.com+"/crear"});
  else
    res.render('other/msg',{head:"Error 403",body:"Solo el responsable de un comite puede crear sesiones",dir:"/usuario/salir",accept:'Cerrar sesion'});

});

router.get('/:com/editar', async (req, res )=> {
  let hash = req.signedCookies["data"];
  let comites = await ses.verComites(hash);
  
  let rol = comites.filter((comite)=> comite.comite==req.params.com);
  if (rol[0]!= undefined)
    rol = rol[0].esResp;
  else
    rol = 0;

  console.table(rol);
  let nom = ses.jwtDec(hash);
  if (nom != undefined)
    nom = nom.nombre;
  else
    nom = "Usuario no enconterado";
    
  if (rol)
    res.render("sesion/editar",{comites:comites,comAct:req.params.com,nom:nom,rol:rol});
  else
    res.render('other/msg',{head:"Error 403",body:"Solo el responsable de un comite puede modificar sesiones",dir:"/usuario/salir",accept:'Cerrar sesion'});

});

router.get('/:com/ver', async (req, res )=> {
  let hash = req.signedCookies["data"];
  let comites = await ses.verComites(hash);
  
  let rol = comites.filter((comite)=> comite.comite==req.params.com);
  if (rol[0]!= undefined)
    rol = rol[0].esResp;
  else
    rol = 0;

  console.table(rol);
  let nom = ses.jwtDec(hash);
  if (nom != undefined)
    nom = nom.nombre;
  else
    nom = "Usuario no enconterado";
    
  if (rol)
    res.render("sesion/ver",{comites:comites,comAct:req.params.com,nom:nom,rol:rol});
  else
    res.render('other/msg',{head:"Error 403",body:"Solo el responsable de un comite puede modificar sesiones",dir:"/usuario/salir",accept:'Cerrar sesion'});

});

// ******************************POST******************* */

router.post('/:com/crear',async(req,res)=>{
  res.send(req.body);
});

router.post('/:com/editar',async(req,res)=>{

});

router.post('/borrar',async(req,res)=>{

});

module.exports = router;
