var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var port = 1212;
const redisClient = require(path.resolve('./redisConnection.js'));


const authRoute = require('./routes/auth');
const tasksRoute = require('./routes/tasks');

var app = express();

// view engine setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(function(req, res, next) {
//TODO lol don't leave this
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, password, username, sessionToken, X-Requested-With, Content-Type, Accept");
  if ('OPTIONS' === req.method) {
      //respond with 200
      res.send(200);
    }
    else {
    //move on
      next();
    }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
 // next(createError(555));
 console.log(req.hostname, req.path)
 next();
});

app.use('/auth', authRoute);
app.use('/tasks', tasksRoute);

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
/*  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};*/

  // render the error page

	res.json({
	  message: err.message,
	  error: err
	});
});

app.listen(port);

module.exports = app;
