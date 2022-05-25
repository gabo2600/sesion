var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const usuarioR = require('./routes/usuarioR');
const comiteR = require('./routes/comiteR');
const sesionR = require('./routes/sesionR');
const documentoR = require('./routes/documentoR');
const observacionR = require('./routes/observacionR');


var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../client/build')));

app.use('/api/usuario', usuarioR);
app.use('/api/comite', comiteR);
app.use('/api/sesion', sesionR);
app.use('/api/documento', documentoR);
app.use('/api/observacion', observacionR);

app.use('', (req,res)=>{
    res.send("error 404 pagina no encontrada")
});

module.exports = app;
