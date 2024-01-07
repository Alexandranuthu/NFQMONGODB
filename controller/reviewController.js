const Review = require ('../model/reviewModel');
const createError = require('http-errors');
const Film = require ('../model/filmModel')
module.exports = {
    likeReview: async (req, res, next) => {
        try {
            const { reviewId } = req.params;
            const userId = req.user.id;
    
            console.log('Review ID:', reviewId);
    
            const review = await Review.findById(reviewId);
    
            console.log('Retrieved Review:', review);
    
            if (!review) {
                throw new createError(404, "No such review exists!");
            }
    
            if (!review.likes.includes(userId)) {
                review.likes.push(userId);
                await review.save();
            }
            res.json({ success: true, message: 'Review liked successfully' });
        } catch (error) {
            console.error(error);
            next(error);
        }
    },
    disLikeReview: async (req, res, next) => {
        try{
            const {reviewId} = req.params;
            const userId = req.user.id;

            const review = await Review.findById(reviewId);

            if(!review) {
                throw new createError(404, "No such review exists!");
            }

            if(!review.dislikes.includes(userId)) {
                review.dislikes.push(userId);
                await review.save();
            }
            res.json({success: true, message: 'Review disliked successfully'});
        }catch(error) {
            console.error(error);
            next(error);
        }
    },
    addReview: async (req, res, next) => {
        const { filmId, text } = req.body;
        const userId = req.user.id;

        try {
            // Create a new review instance
            const newReview = new Review({
                user: userId,
                film: filmId,
                content: text,
                dateAdded: new Date()
            });

            // Save the new review to the database
            const savedReview = await newReview.save();

            res.json({ success: true, data: savedReview });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                success: false,
                error: 'Internal Server Error'
            });
        }
    },
}