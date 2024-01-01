const express = require ('express');
const route = express.Router();

const filmController = require('../controller/filmController')

try{
    route.get('/getFilms', filmController.getFilms);
    route.post('/addFilm', filmController.addFilm);
    route.delete('/deleteFilm/:id', filmController.deleteFilm);
    route.get('/getFile/:path', filmController.getFile);
    route.patch('/addFilm/patch/:id', filmController.updateFilm);
    route.get('/getFilmDetails/:id', filmController.getFilmDetails);
}catch(err){
    console.error(err)
}

module.exports = route;