var express = require('express');
var router = express.Router();

/* 

Los comites son organismos compuestos de varios integrantes y un responsable,
los integrantes son usuarios de tipo(0) y los responsables de tipo(1)

la unica persona capaz de modificar los comites es el usuario Root de tipo (2)

Rutas disponibles
-crear (metodo post)
-editar (metodo put)
-consultar (metodo get)

*/
router.get('/', function(req, res, next) {
  res.send('comite');
});

module.exports = router;
