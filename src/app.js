const createError = require('http-errors');
const express = require('express');
const hbs = require('hbs');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

// Leer archivos .env 
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }) //variables de entorno


const indexR = require('./routes/indexR');
const usuarioR = require('./routes/usuarioR');
const comiteR = require('./routes/comiteR');
const sesionR = require('./routes/sesionR');
const documentoR = require('./routes/documentoR');
const observacionR = require('./routes/observacionR');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(path.join(__dirname,'views/partials'), function (err) {
  console.log(err);
});

// Helpers
//app.use(logger('dev'));
app.use(express.json());
app.use(cookieParser(process.env.SALT));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Rutas
app.use('/', indexR);
app.use('/usuario', usuarioR);
app.use('/comite', comiteR);
app.use('/sesion', sesionR);
app.use('/documento', documentoR);
app.use('/observacion', observacionR);
// error 404
app.use(function(req, res, next) {
  //next(createError(404));
  res.render('other/msg',{head:'Error 404',body:'Pagina no encontrada',dir:'/',accept:'Volver a inicio'});
});


// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('other/error');
});

module.exports = app;
