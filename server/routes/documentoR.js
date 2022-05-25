var express = require('express');
var router = express.Router();

/* 
Los documentos generados en las distintas sesiones del comite,
son divididos en ...

Rutas disponibles
-crear (metodo post)
-editar (metodo put)
-consultar (metodo get)

*/
router.get('/', function(req, res, next) {
  res.send('documento');
});

module.exports = router;
