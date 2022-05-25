var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

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

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexR);
app.use('/usuario', usuarioR);
app.use('/comite', comiteR);
app.use('/sesion', sesionR);
app.use('/documento', documentoR);
app.use('/observacion', observacionR);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
