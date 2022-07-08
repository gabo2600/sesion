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

    res.render("sesion/index",{comites:comites,comAct:com,nom:nom,sesiones:sesiones});
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
        res.render("sesion/crear",{comites:comites,comAct:com, nom:nom});
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

router.get('/editar/:com/:ses', async (req, res )=> {
  var hash = req.signedCookies["data"]; //DAtos de usuario
  var comites=undefined;// Variable que guarda los comites a los que pertenece el usuario
  var nom = undefined;// Nombre completo del usuario(sacado de la cookie)
  var com = undefined;//Comite actual(viene si el usuario es responsable de ese comite o no)
  var sesion = undefined;

  sesion = await ses.ver(req.params.com,req.params.ses);

  if (!!sesion){
    sesion = sesion[0];
    comites = await ses.verComites(hash);

    if (comites!= undefined){
      
      com = comites.filter((comite)=> comite.idComite==req.params.com);
      com = com[0];
      nom = ses.jwtDec(hash);
      nom = nom.nombre;
        
      if (com.esResp)
        res.render("sesion/editar",{comites:comites,comAct:com,nom:nom,sesion:sesion});
      else
        res.render('other/msg',{head:"Error 403",body:"Solo el responsable de un comite puede modificar sesiones",dir:"/",accept:'Volver'});
    }
    else{
      if (ses.jwtDec(hash) !== undefined) //Si la sesion es vigente
        res.render('other/msg',{head:"El usuario no pertenece a ningun comite",body:"Notifoque al administrador",dir:"/usuario/salir",accept:'Cerrar sesion'});
      else
        res.redirect("/");
    }
  }
  else
    res.render('other/msg',{head:"Error 404",body:"Sesion no encontrada",dir:"/sesion/"+req.params.com,accept:'Volver'});
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

  if (!!sesion)
    sesion = sesion[0];
  else
    res.redirect("/");
  if (!!comites){
    com = comites.filter((comite)=> comite.idComite==req.params.com);
    com = com[0];

    nom = ses.jwtDec(hash);
    nom = nom.nombre;
    
    if (!!com)
      res.render("sesion/ver",{
        comites:comites,
        comAct:com,
        nom:nom,
        sesion:sesion,
        doc:doc,
        isAdmin:false
      });
    else
      res.render('other/msg',{head:"El usuario no pertenece a este comite",body:"Notifoque al administrador",dir:"/",accept:'Volver'});

  }
  else{
    let adm = await ses.adminCheck(hash);
    adm = adm[0];
    if (!!adm){
      res.render("sesion/ver",{
        isAdmin:adm,
        sesion:sesion,
        doc:doc,
        comAct:{idComite:req.params.com}
      });
    }
    else
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
      res.render("sesion/crear",{comites:comites,comAct:com, nom:usuario.nombre,err:err});
    }
  }
  else
    res.render('other/msg',{head:"Error 500",body:"...",dir:"/sesion/"+req.params.com,accept:'Volver'});
});


router.post('/editar/:idSes',up.fields([{name:"convocatoria",maxCount:1},{name:"carpeta_de_trabajo",maxCount:1},{name:"acta_preliminar",maxCount:1},{name:"acta_final",maxCount:1}]),async(req,res)=>{
  let hash = req.signedCookies["data"];//Datos del usuario
  let usuario = undefined; //Usuario
  let comites = undefined; //Comites en los que esta el usuario
  let com = undefined; //Comite actual

  let err = undefined; //Guarda los posibles errores de la transaccion
  let {asunto,fi,fc,idSes} = req.body; //Parametros de la sesion
  usuario = ses.jwtDec(hash);

  if (hash!= undefined)
  {
    err = await ses.editar(asunto,fi,fc,usuario.idUsuario,req.files,req.params.idSes);
    if (err.length<1)
      res.render('other/msg',{head:"Hecho",body:"Sesion Modificada exitosamente",dir:"/sesion/",accept:'Volver'});
    else{
      comites = await ses.verComites(hash);// todos los comites a los que el usuario esta inscrito
      //el comite actual
      com = comites.filter((comite)=> comite.idComite==req.params.com);
      com = com[0];
      res.render("sesion/crear",{comites:comites,comAct:com, nom:usuario.nombre,err:err});
    }
  }
  else
    res.render('other/msg',{head:"Error 500",body:"...",dir:"/sesion/"+req.params.com,accept:'Volver'});
});

router.post('/:com/:ses/archivar',async(req,res)=>{

});

module.exports = router;
