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
    'recommended': async (req, res) => {
        try {
            let movies = await db.Movie.findAll({
                include: ['genre'],
                where: {
                    rating: {[Op.gte] : req.params.rating}
                },
                order: [
                    ['rating', 'DESC']
                ]
            })
            let response = {
                meta: {
                    status: 200,
                    total: movies.length,
                    url: '/api/movies/recommended/' + req.params.rating
                },
                data: movies
            }
            return res.status(200).json(response)
        } catch (error) {
            return res.status(error.status || 500).json(error)
        }
    },
    search : async (req,res) => {
        try {
            let movie = await Movies.findAll({
                include: ['genre'],
                where: {
                    [Op.or]: [{
                        title: {
                            [Op.substring]: req.params.title
                        }
                    }]
                }
            })
            let response = {
                meta: {
                    status: 200,
                    total: movie.length,
                    url: '/api/movies/search/' + req.params.title
                },
                data: movie
            }
            return res.status(200).json(response)
        } catch (error) {
            return res.status(error.status || 500).json(error)
        }
    },
    //Aqui dispongo las rutas para trabajar con el CRUD
    create: async (req, res) => {
        try {
            let movieCreate = await Movies
                .create(
                    {
                        title: req.body.title,
                        rating: req.body.rating,
                        awards: req.body.awards,
                        release_date: req.body.release_date,
                        length: req.body.length,
                        genre_id: req.body.genre_id
                    }
                );
            let response;
            if (movieCreate) {
                response = {
                    meta: {
                        status: 201,
                        url: '/api/movies/create',
                        msg: 'La película se ha guardado con éxito!'
                    },
                    data: movieCreate
                };
            } else {
                response = {
                    meta: {
                        status: 204,
                        url: '/api/movies/create',
                        msg: 'Nada se ha guardado!'
                    },
                    data: movieCreate
                };
            }
            return res.status(201).json(response);
        } catch (error) {
            return res.status(error.status || 500).json(error);
        }
    },
    update: async (req, res) => {
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
                        where: { id: movieId }
                    });
            let movieUpdate = await Movies.findByPk(movieId,{
                include : ['genre']
            })
            let response;
            if (update) {
                response = {
                    meta: {
                        status: 202,
                        url: '/api/movies/update/' + movieId,
                        msg: 'Película actualizada'
                    },
                    data: movieUpdate
                };
            } else {
                response = {
                    meta: {
                        status: 204,
                        url: '/api/movies/update/' + movieId,
                        msg: 'Error: no se ha actualizado nada!'
                    },
                    data: movieUpdate
                };
            }
            return res.status(202).json(response);
        } catch (error) {
            return res.status(error.status || 500).json(error);
        }
    },
    destroy: async (req, res) => {
        try {
            let movieId = req.params.id;
            let movieDelete = await Movies.findByPk(movieId,{
                include : ['genre']
            })
            let remove = await Movies
                .destroy({ where: { id: movieId }, force: true });
            let response;
            if (remove) {
                response = {
                    meta: {
                        status: 202,
                        url: '/api/movies/destroy/' + movieId,
                        msg: 'Película borrada!'
                    },
                    data: movieDelete
                };
            } else {
                response = {
                    meta: {
                        status: 204,
                        url: '/api/movies/destroy/' + movieId,
                        msg: 'No borraste nada!'
                    },
                    data: movieDelete
                };
            }
            return res.status(202).json(response);
        } catch (error) {
            return res.status(error.status || 500).json(error);
        }
    }
}

module.exports = moviesController;