const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const db = require('./models/database');

const app = express();

const PORT = 3000;

//Configurar las cookies de sesiones
const session = require('express-session');
app.use(session({
  secret: 'mi_secreto_super_seguro', // cámbialo por algo más fuerte
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24, // 24 horas
    httpOnly: true,
    secure: false // cambiar a true si usas HTTPS
  }
}));
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/usuarios', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


// Inicializar base de datos y servidor
async function startServer() {
  try {
    await db.connect();  // ✅ IMPORTANTE: usar await si es async
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log("Servidor iniciado..en puerto 3000")
    });

  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

startServer();
module.exports = app;
