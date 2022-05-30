var express = require('express');
var router = express.Router();

const ctrl = require("../controller/usuarioC");
const usuarioC = new ctrl();

router.get('/', async(req, res)=> {
  if (req.signedCookies['data'] != undefined)
    res.send("logeado");
  else
    if (!await usuarioC.primerUso()){
      res.redirect("/usuario/login")
    }
    else
      res.redirect('usuario/reg');
});


module.exports = router;
