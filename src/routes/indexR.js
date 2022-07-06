var express = require('express');
var router = express.Router();
const multer = require("multer");

const st = multer.diskStorage({
  destination:'src/public/Files/',
  filename:(req,file,call)=>{
      call("",Date.now()+file.fieldname+".pdf");
  }
});

const up = multer({
  storage:st
});


const usuarioC = require("../controller/usuarioC");
const model = require("../model/model");
let m = new model("usuario");

router.get('/', async(req, res)=> {
  if (req.signedCookies['data'] != undefined){
    let adm = await usuarioC.adminCheck(req.signedCookies["data"]);
    adm = adm[0];
    if (adm)
      res.redirect('/usuario');
    else
      res.redirect('/sesion');
  }else
    if (await usuarioC.primerUso()){
      res.redirect('usuario/reg');
    }
    else
      res.redirect("/usuario/login")   
});

router.get('/test', async(req, res)=> {
  res.send([
    {asd:33},{asd:44},{asd:344}
  ]);
});

router.post("/test",up.fields([{name:"convocatoria",maxCount:1},{name:"carpeta_de_trabajo",maxCount:1},{name:"acta_preliminar",maxCount:1},{name:"acta_final",maxCount:1}]),(req,res)=>{
  console.log(req.body);
  res.send(req.body)
})
  



module.exports = router;
