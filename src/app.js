require('dotenv').config();
const express = require('express');
const path = require('path');
const methodOverride = require('method-override');
const app = express();

//Ejecuto el llamado a mis rutas
const indexRouter = require('./routes/index');
const moviesRoutes = require('./routes/moviesRoutes');
const genresRoutes = require('./routes/genresRoutes');
const actorsRoutes = require('./routes/actorsRoutes');

//Aquí pueden colocar las rutas de las APIs

// chequear conexión DB
const dbConnectionTest = require('./utils/dbConnectionTest');
dbConnectionTest();

// view engine setup
app.set('views', path.resolve(__dirname, './views'));
app.set('view engine', 'ejs');

app.use(express.static(path.resolve(__dirname, '../public')));

//URL encode  - Para que nos pueda llegar la información desde el formulario al req.body
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//Aquí estoy disponiendo la posibilidad para utilizar el seteo en los formularios para el uso de los metodos put o delete
app.use(methodOverride('_method'));

app.use('/', indexRouter);
app.use('/movies', moviesRoutes);
app.use('/genres', genresRoutes);
app.use('/actors', actorsRoutes);
app.use('/api/genres',require('./routes/api/genresRoutes'));
app.use('/api/actors',require('./routes/api/actorsRoutes'));
app.use('/api/movies',require('./routes/api/moviesRoutes'));

//Activando el servidor desde express
app.listen('3001', () => console.log('Servidor corriendo en el puerto 3001'));
