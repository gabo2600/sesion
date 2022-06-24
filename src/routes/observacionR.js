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
router.get('/', async(req, res)=> {
  
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
    res.send({msg:"Error: el usuario no pertenece al comite responsable de este documento"});

});

router.put('/', async(req, res)=> {
  
});

router.delete('/', async(req, res)=> {
  
});

module.exports = router;
