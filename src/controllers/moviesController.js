const path = require('path');
const db = require('../database/models');
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const moment = require('moment');
const {validationResult} = require('express-validator');

//Aqui tienen otra forma de llamar a cada uno de los modelos
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;


const moviesController = {
    'list': (req, res) => {
        db.Movie.findAll({
            include: ['genre']
        })
            .then(movies => {
                res.render('moviesList.ejs', {movies})
            })
            .catch(error => console.log(error));
    },
    'detail': (req, res) => {
        let promMovies = db.Movie.findByPk(req.params.id,
            {
                include : ['genre','actors']
            })
        let promGenres = db.Genre.findAll()
        let promActors = db.Actor.findAll()
        Promise.all([promMovies, promGenres, promActors])
            .then(([movie, allGenres, allActors]) => {
                //movie.release_date = moment(movie.release_date).format('L');
                return res.render('moviesDetail.ejs', {
                    movie,
                    allGenres,
                    allActors
                });
            })
            .catch(error => console.log(error));
    },
    'newMovie': (req, res) => {
        db.Movie.findAll({
            order : [
                ['release_date', 'DESC']
            ],
            limit: 5
        })
            .then(movies => {
                res.render('newestMovies', {movies});
            })
            .catch(error => console.log(error));
    },
    'recommended': (req, res) => {
        db.Movie.findAll({
            include: ['genre'],
            where: {
                rating: {[Op.gte] : 8}
            },
            order: [
                ['rating', 'DESC']
            ]
        })
            .then(movies => {
                res.render('recommendedMovies.ejs', {movies});
            })
            .catch(error => console.log(error));
    },
    search : (req,res) => {
        Movies.findAll({
            where: {
                [Op.or]: [{
                    title: {
                        [Op.substring]: req.query.keywords
                    }
                }]
            }
        })
            .then(movies => res.render('moviesResult',{
                title: 'Resultado de la búsqueda',
                movies,
                busqueda: req.query.keywords.trim()
            }))
            .catch(error => console.log(error));
    },
    //Aqui dispongo las rutas para trabajar con el CRUD
    add: function (req, res) {
        let promGenres = Genres.findAll({order: [['name']]});
        let promActors = Actors.findAll({order: [['last_name']]});
        
        Promise
        .all([promGenres, promActors])
        .then(([allGenres, allActors]) => {
            return res.render(path.resolve(__dirname, '..', 'views',  'moviesAdd'), {allGenres,allActors})})
        .catch(error => res.send(error))
    },
    create: function (req,res) {
        let errors = validationResult(req);
        if (errors.isEmpty()) {
            Movies
            .create(
                {
                    title: req.body.title,
                    rating: req.body.rating,
                    awards: req.body.awards,
                    release_date: req.body.release_date,
                    length: req.body.length,
                    genre_id: req.body.genre_id
                }
            )
            .then(()=> {
                return res.redirect('/movies')})            
            .catch(error => res.send(error))
        } else {
            let promGenres = Genres.findAll({order: [['name']]});
            let promActors = Actors.findAll({order: [['last_name']]});
            
            Promise
            .all([promGenres, promActors])
            .then(([allGenres, allActors]) => {
                return res.render(path.resolve(__dirname, '..', 'views',  'moviesAdd'), {
                    allGenres,
                    allActors,
                    errors: errors.mapped(),
                    old: req.body
                })})
            .catch(error => res.send(error))
        }
    },
    edit: function(req,res) {
        let movieId = req.params.id;
        let promMovies = Movies.findByPk(movieId,{include: ['genre','actors']});
        let promGenres = Genres.findAll({order: [['name']]});
        let promActors = Actors.findAll({order: [['last_name']]});
        Promise
        .all([promMovies, promGenres, promActors])
        .then(([Movie, allGenres, allActors]) => {
            Movie.release_date = moment(Movie.release_date).format('L');
            return res.render(path.resolve(__dirname, '..', 'views',  'moviesEdit'), {Movie,allGenres,allActors})})
        .catch(error => res.send(error))
    },
    update: function (req,res) {
        let errors = validationResult(req);
        let movieId = req.params.id;

        if (errors.isEmpty()) {
            Movies
            .update(
                {
                    title: req.body.title,
                    rating: req.body.rating,
                    awards: req.body.awards,
                    release_date: req.body.release_date,
                    length: req.body.length,
                    genre_id: req.body.genre_id
                },
                {
                    where: {id: movieId}
                })
            .then(()=> {
                return res.redirect('/movies')})            
            .catch(error => res.send(error))
        } else {
            let movieId = req.params.id;
            let promMovies = Movies.findByPk(movieId,{include: ['genre','actors']});
            let promGenres = Genres.findAll({order: [['name']]});
            let promActors = Actors.findAll({order: [['last_name']]});
            Promise
            .all([promMovies, promGenres, promActors])
            .then(([Movie, allGenres, allActors]) => {
                Movie.release_date = moment(Movie.release_date).format('L');
                return res.render(path.resolve(__dirname, '..', 'views',  'moviesEdit'), {
                    Movie,
                    allGenres,
                    allActors,
                    errors: errors.mapped(),
                    old: req.body
                })})
            .catch(error => res.send(error))
        }
    },
    remove: function (req,res) {
        let movieId = req.params.id;
        Movies
        .findByPk(movieId)
        .then(Movie => {
            return res.render(path.resolve(__dirname, '..', 'views',  'moviesDelete'), {Movie})})
        .catch(error => res.send(error))
    },
    destroy: function (req,res) {
        let movieId = req.params.id;
        Movies
        .destroy({where: {id: movieId}, force: true}) // force: true es para asegurar que se ejecute la acción
        .then(()=>{
            return res.redirect('/movies')})
        .catch(error => res.send(error))
    }
}

module.exports = moviesController;