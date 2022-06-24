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
  let hash = req.signedCookies["data"]; //DAtos de usuario
  let comites=undefined;// Variable que guarda los comites a los que pertenece el usuario
  let com = undefined;//Comite seleccionado
  let sesiones=undefined;//Sesiones del comite seleccionado
  let nom = undefined;// Nombre completo del usuario(sacado de la cookie)
  
  comites = await ses.verComites(hash);

  if (comites!= undefined){
    sesiones = await ses.ver(req.params.com);

    com = comites.filter((comite)=> comite.idComite==req.params.com);
    com = com[0];

    nom = ses.jwtDec(hash);
    nom = nom.nombre;

    res.render("sesion/index",{comites:comites,comAct:com,nom:nom,rol:com.esResp,sesiones:sesiones});
  }else
    if (ses.jwtDec(hash) !== undefined) //Si la sesion es vigente
      res.render('other/msg',{head:"El usuario no pertenece a ningun comite",body:"Notifoque al administrador",dir:"/usuario/salir",accept:'Cerrar sesion'});
    else
      res.redirect("/");
});

router.get('/crear/:com', async (req, res )=> {
  var hash = req.signedCookies["data"]; //DAtos de usuario
  var comites=undefined;// Variable que guarda los comites a los que pertenece el usuario
  var com = undefined;//Comite seleccionado
  var nom = undefined;// Nombre completo del usuario(sacado de la cookie)
  
  comites = await ses.verComites(hash);// todos los comites a los que el usuario esta inscrito
  
  if (comites!= undefined){
    com = comites.filter((comite)=> comite.idComite==req.params.com);
    com = com[0];

    if (com!==undefined)
    {
      nom = ses.jwtDec(hash);
      nom = nom.nombre;

      if (com.esResp)
        res.render("sesion/crear",{comites:comites,comAct:com, nom:nom, rol:com.esResp});
      else
        res.render('other/msg',{head:"Error 403",body:"Solo el responsable de un comite puede crear sesiones",dir:"/",accept:'Volver'});
    }
    else
      res.render('other/msg',{head:"Error 404",body:"Comite no encontrado",dir:"/",accept:'Volver'});
  }
  else{
    if (ses.jwtDec(hash) !== undefined) //Si la sesion es vigente
      res.render('other/msg',{head:"El usuario no pertenece a ningun comite",body:"Notifoque al administrador",dir:"/usuario/salir",accept:'Cerrar sesion'});
    else
      res.redirect("/");
  }
});

router.get('/editar/:com', async (req, res )=> {
  var hash = req.signedCookies["data"]; //DAtos de usuario
  var comites=undefined;// Variable que guarda los comites a los que pertenece el usuario
  var nom = undefined;// Nombre completo del usuario(sacado de la cookie)
  var rol = undefined;

  comites = await ses.verComites(hash);
  if (comites!= undefined){
    rol = comites.filter((comite)=> comite.comite==req.params.com.replace(/-/g,' '));
    if (rol[0]!= undefined)
      rol = rol[0].esResp;
    else
      rol = 0;

    nom = ses.jwtDec(hash);
    nom = nom.nombre;
      
    if (rol)
      res.render("sesion/editar",{comites:comites,comAct:req.params.com.replace(/-/g,' '),nom:nom,rol:rol});
    else
      res.render('other/msg',{head:"Error 403",body:"Solo el responsable de un comite puede modificar sesiones",dir:"/usuario/salir",accept:'Cerrar sesion'});
  }
  else{
    if (ses.jwtDec(hash) !== undefined) //Si la sesion es vigente
      res.render('other/msg',{head:"El usuario no pertenece a ningun comite",body:"Notifoque al administrador",dir:"/usuario/salir",accept:'Cerrar sesion'});
    else
      res.redirect("/");
  }
});

router.get('/ver/:com/:ses', async (req, res )=> {
  let hash = req.signedCookies["data"];//Datos del usuario
  let comites = undefined;//Comites a los que esta registrado
  let com = undefined;  //Comite seleccionado
  let nom = undefined; //Nombre del usuario

  let sesion = undefined; //Sesion seleccionada
  let doc = undefined; //Documentos relacionados a la sesion

  comites = await ses.verComites(hash);
  sesion = await ses.ver(req.params.com,req.params.ses);
  doc = await ses.verDoc(req.params.ses);

  if (comites!= undefined){
    sesion = sesion[0];
    com = comites.filter((comite)=> comite.idComite==req.params.com);
    com = com[0];

    nom = ses.jwtDec(hash);
    nom = nom.nombre;
    

    res.render("sesion/ver",{
      comites:comites,
      comAct:com,
      nom:nom,
      rol:com.esResp,
      sesion:sesion,
      doc:doc
    });
  }
  else{
    if (ses.jwtDec(hash) !== undefined) //Si la sesion es vigente
      res.render('other/msg',{head:"El usuario no pertenece a ningun comite",body:"Notifoque al administrador",dir:"/usuario/salir",accept:'Cerrar sesion'});
    else
      res.redirect("/");
  }
});

// *******************************POST***************************** */

router.post('/:com/crear',up.fields([{name:"convocatoria",maxCount:1},{name:"carpeta_de_trabajo",maxCount:1},{name:"acta_preliminar",maxCount:1},{name:"acta_final",maxCount:1}]),async(req,res,next)=>{
  let hash = req.signedCookies["data"];//Datos del usuario
  let usuario = undefined; //Usuario
  let comites = undefined; //Comites en los que esta el usuario
  let com = undefined; //Comite actual

  let err = undefined; //Guarda los posibles errores de la transaccion
  let {asunto,fi,fc} = req.body; //Parametros de la sesion

  usuario = ses.jwtDec(hash);

  if (hash!= undefined)
  {
    err = await ses.crear(asunto,fi,fc,req.params.com,usuario.idUsuario,req.files);

    if (err.length<1)
      res.render('other/msg',{head:"Hecho",body:"Sesion Guardada exitosamente",dir:"/sesion/"+req.params.com,accept:'Volver'});
    else{
      comites = await ses.verComites(hash);// todos los comites a los que el usuario esta inscrito
      //el comite actual
      com = comites.filter((comite)=> comite.idComite==req.params.com);
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
