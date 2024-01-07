const express = require('express');
const routes = express.Router();
const watchlistContoller = require ('../controller/watchlistController');
const authmiddleware = require('../helpers/jwtHelper');
try{
    routes.use(authmiddleware.verifyAccessToken);
    routes.post('/addToWatchlist/:id', watchlistContoller.addWatchlist);
    routes.get('/getWatchlist', watchlistContoller.getWatchList);
}catch(err){
    console.error(err);
}
module.exports = routes;