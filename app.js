var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var sassMiddleware = require('node-sass-middleware');
var session = require('express-session');
var indexRouter = require('./routes/index');
var userRouter = require('./routes/user');
var roleRouter = require('./routes/role');
var fileUpload = require('express-fileupload');
var restResouces = require('./routes/resources');
var app = express();
var EventEmitter = require('events');
const { get } = require('axios');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('api site', 'http://localhost:50355/resources')
app.set('avatar size', 300)
const events = new EventEmitter();
app.set('events', events)
events.on('updated', async (req, callback) => {
  req.session.user = (await get(req.session.user._links.self.href, {params: { projection: 'UserExcerpt' }})).data;
  req.session.user.personal.avatar = 'data:image/png;base64, ' + req.session.user.personal.avatar
  setTimeout(callback);
})
app.set('publish event', function (eventName, ...args) {
  return new Promise(ok => {
    events.emit(eventName, ...args, ok)
  })
})
app.set('jwt secret', '大五天下第一');
app.set('jwt expire', Date => Math.floor(Date.now() / 1000) + (2 * 60 * 60))

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: 
`昔のものがたり
未来のものがたり
今あたしがつむぐ日々が
つないでいくの
願いをのせて`,
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 12 }
}))
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}))
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 },
}))
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/user', userRouter);
app.use('/role', roleRouter);
app.use('/resources', restResouces);

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
