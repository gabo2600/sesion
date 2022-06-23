var express = require('express');
var router = express.Router();
var ses = require("../controller/sesionC");

//Middleware para subir archivos
const multer = require("multer");
const st = multer.diskStorage({
    destination:'src/public/Files/',
    filename:(req,file,call)=>{
        call("",Date.now()+file.fieldname+".pdf");
    }
});

const up = multer({
    storage:st
});



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
  if (com!= undefined){    
    res.redirect("/sesion/"+com[0].idComite);
  }else
    res.render('other/msg',{head:"El usuario no pertenece a ningun comite",body:"Notifoque al administrador",dir:"/usuario/salir",accept:'Cerrar sesion'});
});


router.get('/:com', async (req, res )=> {
  let hash = req.signedCookies["data"];

  let comites = await ses.verComites(hash);
  //Las sesiones de un comite en especifico
  let sesiones = await ses.ver(req.params.com);

  let com = comites.filter((comite)=> comite.idComite==req.params.com);
  com = com[0];

  let nom = ses.jwtDec(hash);
  if (nom != undefined)
    nom = nom.nombre;
  else
    nom = "Usuario no enconterado"
  res.render("sesion/index",{comites:comites,comAct:com,nom:nom,rol:com.esResp,sesiones:sesiones});
});

router.get('/crear/:com', async (req, res )=> {
  let hash = req.signedCookies["data"];
  let comites = await ses.verComites(hash);// todos los comites a los que el usuario esta inscrito
  
  //el comite actual
  let com = comites.filter((comite)=> comite.idComite==req.params.com);
  com = com[0];
  if (com!==undefined)
  {
    let nom = ses.jwtDec(hash);

    if (nom != undefined)
      nom = nom.nombre;
    else 
      nom = "Error";

    if (com.esResp)
      res.render("sesion/crear",{comites:comites,comAct:com, nom:nom, rol:com.esResp});
    else
      res.render('other/msg',{head:"Error 403",body:"Solo el responsable de un comite puede crear sesiones",dir:"/",accept:'Volver'});

  }
  else
    res.render('other/msg',{head:"Error 404",body:"Comite no encontrado",dir:"/",accept:'Volver'});

  
});

router.get('/editar/:com', async (req, res )=> {
  let hash = req.signedCookies["data"];
  let comites = await ses.verComites(hash);
  
  let rol = comites.filter((comite)=> comite.comite==req.params.com.replace(/-/g,' '));
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
    res.render("sesion/editar",{comites:comites,comAct:req.params.com.replace(/-/g,' '),nom:nom,rol:rol});
  else
    res.render('other/msg',{head:"Error 403",body:"Solo el responsable de un comite puede modificar sesiones",dir:"/usuario/salir",accept:'Cerrar sesion'});

});

router.get('/ver/:com/:ses', async (req, res )=> {
  let hash = req.signedCookies["data"];

  let comites = await ses.verComites(hash);
  //Las sesion seleccionada
  let sesion = await ses.ver(req.params.com,req.params.ses);
  //Documentos de la sesion
  let doc = await ses.verDoc(req.params.ses);

  sesion = sesion[0];
  let com = comites.filter((comite)=> comite.idComite==req.params.com);
  com = com[0];

  let nom = ses.jwtDec(hash);
  if (nom != undefined)
    nom = nom.nombre;
  else
    nom = "Usuario no enconterado";

  res.render("sesion/ver",{
    comites:comites,
    comAct:com,
    nom:nom,
    rol:com.esResp,
    sesion:sesion,
    doc:doc
  });
});

// *******************************POST***************************** */

router.post('/:com/crear',up.fields([{name:"convocatoria",maxCount:1},{name:"carpeta_de_trabajo",maxCount:1},{name:"acta_preliminar",maxCount:1},{name:"acta_final",maxCount:1}]),async(req,res,next)=>{
  let hash = req.signedCookies["data"];
  let usuario = ses.jwtDec(hash);

  if (hash!= undefined)
  {
    let {asunto,fi,fc} = req.body;
    let idComite = req.params.com,idUsuario = usuario.idUsuario;

    let err = await ses.crear(asunto,fi,fc,idComite,idUsuario,req.files);

    if (err.length<1)
      res.render('other/msg',{head:"Hecho",body:"Sesion Guardada exitosamente",dir:"/sesion/"+req.params.com,accept:'Volver'});
    else{
      let comites = await ses.verComites(hash);// todos los comites a los que el usuario esta inscrito
      //el comite actual
      let com = comites.filter((comite)=> comite.idComite==req.params.com);
      com = com[0];
      res.render("sesion/crear",{comites:comites,comAct:com, nom:usuario.nombre, rol:com.esResp,err:err});
    }
  }
  else
    res.render('other/msg',{head:"Error 500",body:"...",dir:"/sesion/"+req.params.com,accept:'Volver'});
});

router.post('/:com/:ses/editar',async(req,res)=>{

});

router.post('/:com/:ses/archivar',async(req,res)=>{

});

module.exports = router;
