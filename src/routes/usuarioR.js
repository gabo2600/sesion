var express = require('express');
var router = express.Router();
const ctrl = require("../controller/usuarioC");
const usuarioC = new ctrl();

/* Rutas
Son los distintos usuarios del sistema los cuales se dividen en tres categorias
usando como diferenciador el campo tipoUsuario en la bd, los tres tipos de usuario son:
-miembro de un comite (0)
-responsable de un comite (1)
-usuario root (2)

Rutas disponibles
-crear (metodo post)
-editar (metodo put)
-consultar (metodo get)
-borrar (metodo delete)

*/
router.get('/', function(req, res, next) {
  
  res.json();
});

router.post('/', function(req, res, next) {
  let { nom,pat,mat,user,pass,type,hash } = req.body;
  

});

router.put('/', function(req, res, next) {
  res.send('usuario');
});

router.delete('/', function(req, res, next) {
  res.send('usuario');
});

module.exports = router;
