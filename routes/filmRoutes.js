const express = require ('express');
const route = express.Router();
const authmiddleware = require('../helpers/jwtHelper');

const filmController = require('../controller/filmController')

try{
    route.use(authmiddleware.verifyAccessToken);
    route.get('/getFilms', filmController.getFilms);
    route.post('/addFilm', filmController.addFilm);
    route.delete('/deleteFilm/:id', filmController.deleteFilm);
    route.get('/getFile/:path', filmController.getFile);
    route.put('/updateFilm/:id', filmController.updateFilm);
    route.get('/getFilmDetails/:id', filmController.getFilmDetails);
    route.get('/film/random', filmController.getRandom);
    route.post('/addRating', filmController.addRating);
    route.post('/addReview', filmController.addReview);
}catch(err){
    console.error('Error during route registration:', err);
}

module.exports = route;