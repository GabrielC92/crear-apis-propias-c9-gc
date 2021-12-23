const { check, body } = require('express-validator');
const db = require('../database/models');

module.exports = [
    check('title').notEmpty().withMessage('Ingresar título de película').bail()
    .custom((value,{req}) => {
        if (typeof value != 'string') {
            return false;
        }
        return true;
    }).withMessage('Solo se admiten caracteres alfabéticos'),

    body('title')
    .custom((value,{req}) => {
        return db.Movie.findOne({
            where: {
                title: value
            }
        })
            .then(movie => {
                if (!movie) {
                    return true;
                } else {
                    return Promise.reject('Esta película está en la base de datos')
                }
            })
    }),
    
    check('rating').notEmpty().withMessage('Ingresar rating de película').bail()
    .isNumeric().withMessage('Debe ser un dato numérico entero o decimal').bail()
    .isLength({min: 0}).withMessage('El valor mínimo es cero'),

    check('awards').notEmpty().withMessage('Ingresar cantidad de premios').bail()
    .isInt().withMessage('Debe ser un número entero').bail()
    .isLength({min: 0}).withMessage('El valor mínimo es cero'),

    check('release_date').notEmpty().withMessage('Ingresar fecha de estreno').bail()
    .isDate().withMessage('Debe ingresar día, mes y año'),

    check('length').notEmpty().withMessage('Ingresar duración en minutos').bail()
    .isInt().withMessage('Debe ser un número entero').bail()
    .isLength({min: 0}).withMessage('El valor mínimo es cero'),

    check('genre_id').notEmpty().withMessage('Selecciona un género')
]