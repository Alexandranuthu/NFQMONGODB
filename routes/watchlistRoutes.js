const express = require('express');
const routes = express.Router();
const watchlistContoller = require ('../controller/watchlistController');

try{
    routes.get('/watchlist/getWatchList', watchlistContoller.getWatchList);
    routes.post('/addMovieToWatchlist', watchlistContoller.addWatchlist);
}catch(err){
    console.error(err);
}
module.exports = routes;