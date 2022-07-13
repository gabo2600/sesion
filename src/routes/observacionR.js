var express = require('express');
var router = express.Router();
var obs = require("../controller/observacionC");

/* 

Cada miembro del comite puede poner observaciones en algun documento dado,
y solamente el usuario que las puso puede editarlas

Este modulo funciona como una resful api para poder crear y editar comentarios sin refrescar la pagina

Rutas disponibles
-crear (metodo post)
-editar (metodo put)
-consultar (metodo get)
-borrar (metodo delete)

*/
router.get('/:com/:ses/:tipo', async(req, res)=> {
  let hash = req.signedCookies["data"];//datos de la ccokie del usuario...
  let {com,ses,tipo} = req.params; //Datos del documento
  let response =  undefined;

  if (com!=undefined && ses!=undefined && tipo!=undefined){
    response = await obs.index(com,ses,tipo,hash);
  }
  res.send(response);
});

router.post('/', async(req, res)=> {
  let hash = req.signedCookies["data"];//datos de la ccokie del usuario...
  let {observacion,data} = req.body; //Datos de la observacion
  let response =  undefined;

  if (await obs.auth(hash,data))
  {
    response = await obs.crear(observacion,data,hash);
    res.send({msg:response});
  }
  else
    res.send({msg:"El usuario no pertenece al comite responsable de este documento"});

});

router.put('/', async(req, res)=> {
    let hash = req.signedCookies["data"];//datos de la ccokie del usuario...
    let {idObs,txt} = req.body;   //Datos de la observacion
    let r = undefined; //Mensaje a retornar
    let idUsuario = obs.jwtDec(hash); //Variable que guarda el id del usuario

    if (!!idObs)
      if (!!idUsuario){
        idUsuario = idUsuario.idUsuario;
        r = await obs.editar(idObs,txt,idUsuario);
        res.send({msg:r});
      }
      else
        res.send({msg:"Su sesion de usuario a expirado por favor vuelva a ingresar"});
    else
      res.send({msg:"Observación no encontrada"})
});

router.delete('/:idObs', async(req, res)=> {
  let hash = req.signedCookies["data"];//datos de la ccokie del usuario...
  let idObs = req.params.idObs; //id de la observación
  let r = undefined; //Mensaje a retornar
  let idUsuario = obs.jwtDec(hash);

  if (idObs!= undefined)
    if (idUsuario!= undefined){
      idUsuario = idUsuario.idUsuario;
      r = await obs.borrar(idObs,idUsuario);
      res.send({msg:r});
    }
    else
      res.send({msg:"Su sesion de usuario a expirado por favor vuelva a ingresar"});
  else
    res.send({msg:"404 Observación no encontrada"})
});

module.exports = router;
