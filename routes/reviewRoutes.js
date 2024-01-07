const express = require ('express');
const router = express.Router();
const reviewController = require('../controller/reviewController');
const authmiddleware = require('../helpers/jwtHelper');

try{
    router.use(authmiddleware.verifyAccessToken);
    router.post('/addReview', reviewController.addReview);
    router.post('/like/:reviewId', reviewController.likeReview);
    router.post('/dislike/:reviewId', reviewController.disLikeReview);
    router.post('/like/:filmId/:reviewId', reviewController.likeReview);
    // router.post('/comment/:reviewId', reviewController.addComment);
    // router.post('/vote/:reviewId', reviewController.voteReview);
}catch(err) {
    console.error(err);
}

module.exports = router;