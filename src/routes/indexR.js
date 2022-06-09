var express = require('express');
const res = require('express/lib/response');
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
      res.send("Usuario normal")
  }else
    if (await usuarioC.primerUso()){
      res.redirect('usuario/reg');
    }
    else
      res.redirect("/usuario/login")   
});

router.get('/test', async(req, res)=> {
  res.send({
    //AdminCheck: await usuarioC.adminCheck(req.signedCookies["data"]),
    primerUso: await usuarioC.adminCheck()
  });
});

router.post("/test",(req,res)=>{
  console.log(req.body);
  res.send(req.body)
})
  



module.exports = router;
