const path = require('path');
const db = require('../../database/models');
const sequelize = db.sequelize;
const { Op } = require("sequelize");

//Aqui tienen otra forma de llamar a cada uno de los modelos
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;

const moviesController = {
    'list': async (req, res) => {
        try {
            let movies = await db.Movie.findAll({
                include : ['genre']
            })
            let response = {
                meta: {
                    status: 200,
                    total: movies.length,
                    url: '/api/movies'
                },
                data: movies
            }
            return res.status(200).json(response);
        } catch (error) {
            return res.status(error.status || 500).json(error);
        }
    },
    'detail': async (req, res) => {
        try {
            let movie = await db.Movie.findByPk(req.params.id,
                {
                    include : ['genre']
                })
            let response = {
                meta: {
                    status: 200,
                    url: '/api/movies/' + req.params.id
                },
                data: movie
            }
            return res.status(200).json(response);
        } catch (error) {
            return res.status(error.status || 500).json(error);
        }
    },
    'newMovies': async (req, res) => {
        try{
            let movie = await db.Movie.findAll({
                order : [
                    ['release_date', 'DESC']
                ],
                limit: 5
            })
            let response = {
                meta: {
                    status: 200,
                    url: '/api/movies/news'
                },
                data: movie,
            }
            return res.status(200).json(response)
        } catch(error){
            return res.status(error.status || 500).json(error)
        }
    },
    'recommended': async (req, res) => {
        try {
            let movie = await db.Movie.findAll({
                include: ['genre'],
                where: {
                    rating: {[Op.gte] : 8}
                },
                order: [
                    ['rating', 'DESC']
                ]
            })
            let response = {
                meta: {
                    status: 200,
                    total: movie.length,
                    url: '/api/movies/recommended'
                },
                data: movie
            }
            return res.status(200).json(response)
        } catch (error) {
            return res.status(error.status || 500).json(error)
        }
    },
    search : async (req,res) => {
        try {
            let movie = await Movies.findAll({
                where: {
                    [Op.or]: [{
                        title: {
                            [Op.substring]: req.query.keywords
                        }
                    }]
                }
            })
            let response = {
                meta: {
                    status: 200,
                    total: movie.length,
                    url: '/api/movies/search' + req.query.keywords
                },
                data: movie
            }
            return res.status(200).json(response)
        } catch (error) {
            return res.status(error.status || 500).json(error)
        }
    },
    //Aqui dispongo las rutas para trabajar con el CRUD
    create: async function (req,res) {
        try {
            let movie = await Movies
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
            let response = {
                status: 201,
                meta: {
                    url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
                    msg: 'La película se ha guardado con éxito'
                },
                data: movie
            }
            return res.status(201).json(response)
        } catch (error) {
            return res.status(error.status || 500).json(error)
        }
    },
    update: async function (req,res) {
        try {
            let movieId = req.params.id;
            let update = await Movies
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
            //if (update[0] === 1) {
                let response = {
                    status: 200,
                    meta: {
                        url: '/api/movies/update/' + movieId,
                        msg: 'Película actualizada'
                    },
                    data: update
                }
                return res.status(200).json(response)
            /* }else{
                throw new Error
            } */
        } catch (error) {
            return res.status(error.status || 500).json(error)
        }
    },
    destroy: async function (req,res) {
        try {
            let movieId = req.params.id;
            let remove = await Movies
            .destroy({where: {id: movieId}})
            //res.json(remove)
            //if (remove[0] === 1) {
                let response = {
                    status: 200,
                    meta: {
                        url: '/api/movies/destroy/' + movieId,
                        msg: 'Película borrada!'
                    },
                    data: remove
                }
                return res.status(200).json(response)
            /* } else {
                throw new Error
            } */
        } catch (error) {
            return res.status(error.status || 500).json(error)
        }
    }
}

module.exports = moviesController;