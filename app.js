var createError = require('http-errors');
var proxy = require('express-http-proxy');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const history = require('connect-history-api-fallback')

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

app.all('*', function (req, res, next) {//必须卸载app.get前面才有效
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type,Content-Length, Authorization, Accept,X-Requested-With");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", ' 3.2.1');
  if (req.method == "OPTIONS") {
    res.send(200);
    /*让options请求快速返回*/
  } else {
    next();
  }
});

app.use('/common', proxy( 
  '192.168.0.254:8080',  // 目标域名，只能写域名，不能带上pathname
  {
    proxyReqPathResolver: function(request) {
      console.log(request.baseUrl)  // '/proxy'
      console.log(request.url) // ' /api/search'
      return request.url // 目标数据的pathname,必须有
    },
    https:true,
    reqAsBuffer:true
  }
));


app.use(history());
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);

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
  res.render('error');
});

module.exports = app;
