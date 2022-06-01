var express = require('express');
var router = express.Router();

const ctrl = require("../controller/usuarioC");
const usuarioC = new ctrl();
const model = require("../model/model");
let m = new model("usuario");

router.get('/', async(req, res)=> {
  if (req.signedCookies['data'] != undefined){
    let adm = await usuarioC.adminCheck(req.signedCookies["data"]);
    adm = adm[0];
    if (adm)
      res.redirect('/usuario');
    else
      res.redirect('/usuario/login');
  }else
    if (await usuarioC.primerUso()){
      res.redirect('usuario/reg');
    }
    else
      res.redirect("/usuario/login")   
});

router.get('/test', async(req, res)=> {
  res.send({
    AdminCheck: await usuarioC.adminCheck(req.signedCookies["data"])
    
  });
});



module.exports = router;
