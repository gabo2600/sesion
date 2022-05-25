var express = require('express');
var router = express.Router();

/* 
Las sesiones son ejercisios en los cuales se discuten ciertos temas y se
realizan acuerdos, solo pueden vizualisarlas los miembros del comite que las creo

Solo pueden ser creadas y editadas por el responsable del comite que las creo

Rutas disponibles
-crear (metodo post)
-editar (metodo put)
-consultar (metodo get)

*/
router.get('/', function(req, res, next) {
  res.send('sesion');
});

module.exports = router;
