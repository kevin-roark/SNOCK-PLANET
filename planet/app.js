
var express = require('express');
var path = require('path');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');

var config = require('./public/javascripts/config');

var app = express();

var port = process.env.PLANET_WEB_PORT || '3000';
app.listen(port);
console.log('web listening on *:' + port);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(config.static_path));

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Content not found / Missing Content / Looking for Content');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    title: "NEW SNOCK PLANET COULDN'T FIND YOUR CONTENT — GO HOME PLEASE",
    error: config.isDebug ? err : {}
  });
});

module.exports = app;
