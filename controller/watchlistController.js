const { populate } = require('../model/userModel');
const Watchlist = require('../model/watchlistModel');
const createError = require('http-errors');

module.exports = {
    // getWatchList controller
getWatchList: async (req, res, next) => {
    try {
        const userId = req.user.id; // Use the correct way to get the authenticated user's ID
        const watchlistItems = await Watchlist.find({ user: userId })
            .populate({
                path: "films.film",
                select: "title",
            })
            .populate({
                path: 'user',
                select: "username"
            });

        res.status(200).json(watchlistItems);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
},




    // Add a new watchlist item based on the request body
    addWatchlist: async (req, res, next) => {
        try {
            // Extract movie details from the request body

            console.log('req.user:', req.user);
            console.log('req.body', req.body);


            const { filmId } = req.body;

            if (!req.user.id) {
                throw createError(401, 'Unauthorized');
            }
            
            // Create a new watchlist item
            const newWatchlistItem = new Watchlist({
                user: req.user.id, // Use the correct way to get the authenticated user's ID
                films: [{film : filmId}], // Use the filmId received from the request body
            });

            // Save the new watchlist item to the database
            const savedWatchlistItem = await newWatchlistItem.save();

            // Send a success response
            res.status(200).json({
                 success: true,
                message: 'Movie added to watchlist successfully', 
                watchlistItem: savedWatchlistItem });
        } catch (error) {
            console.error('Error adding movie to watchlist:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Internal server error' });
        }
},
}
