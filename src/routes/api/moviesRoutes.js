const express = require('express');
const router = express.Router();
const { list, detail, recommended, search, create, update, destroy } = require('../../controllers/api/moviesController');

router
    .get('/', list)
    .get('/:id', detail)
    .get('/recommended/:rating', recommended)
    .get('/search/:title', search)
    .post('/create', create)
    .put('/update/:id', update)
    .delete('/destroy/:id', destroy)

module.exports = router;