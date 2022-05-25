var express = require('express');
var router = express.Router();

const ctrl = require("../controller/usuarioC");
const usuarioC = new ctrl();


router.get('/', function(req, res, next) {
  if (!usuarioC.primerUso()){
    res.redirect("/usuario/login")
  }
  else
    res.redirect('usuario/reg');
});


module.exports = router;
