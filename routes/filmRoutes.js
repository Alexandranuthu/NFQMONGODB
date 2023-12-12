const express = require ('express');
const router = express.Router();

const filmController = require('../controller/filmController')

try{
    router.get('/getFilm', filmController.getFilm);
    router.post('/addFilm', filmController.addFilms);
}catch(err){
    console.error(err)
}

module.exports = router;