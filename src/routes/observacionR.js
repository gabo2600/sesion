var express = require('express');
var router = express.Router();

/* 

Cada miembro del comite puede poner observaciones en algun documento dado,
y solamente el usuario que las puso puede editarlas

Rutas disponibles
-crear (metodo post)
-editar (metodo put)
-consultar (metodo get)
-borrar (metodo delete)

*/
router.get('/', function(req, res, next) {
  res.send('observacion');
});

module.exports = router;
