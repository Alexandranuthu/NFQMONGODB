const Lists = require('../routes/listsRoutes');
const createError = require('http-errors');

module.exports = {
    addLists: async(req,res,next) => {
        const list = new Lists(req.body);
        
        try {
            // Save the new film to the databased
            const newLists= await list.save();

            // Respond with a JSON object containing the new film
            res.status(201).json({ success: true, data: newLists });
        } catch (error) {
            // Handle errors (e.g., validation error) and respond with an error message
            res.status(400).json({ success: false, message: error.message });
        }
    },
    // Controller function to delete a film by ID
    deleteList: async (req, res, next) => {
        // Extract the film ID from the request parameters
        const id = req.params.id;

        try {
            // Find and delete the film with the specified ID
            const list = await Lists.findByIdAndDelete(id);

            // If the film does not exist, throw a 404 error
            if (!list) {
                throw createError(404, 'List does not exist');
            }

            // Respond with a JSON object containing the deleted film
            res.json({ success: true, data: list });
        } catch (error) {
            // Handle errors (e.g., invalid ID) and pass to the error-handling middleware
            console.error(error.message);
            if (error instanceof mongoose.CastError) {
                next(createError(400, "Invalid list id"));
                return;
            }
            next(error);
        }
    },
    getLists: async (req, res, next) => {
        const typeQuery = req.query.type;
        const genreQuery = req.query.genre;
        let list = [];
    
        try {
            if (typeQuery) {
                if (genreQuery) {
                    list = await Lists.aggregate([
                        { $sample: { size: 10 } },
                        { $match: { type: typeQuery, genre: genreQuery } }
                    ]);
                } else {
                    list = await Lists.aggregate([{ $sample: { size: 10 } }]);
                }
            }
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, error: 'Internal Server Error' });
        }
    
        res.json({ success: true, data: list });
    },
    updateList: async (req, res, next) => {
        // Extract the film ID from the request parameters
        const id = req.params.id;
    
        try {
            // Find the film by ID and update its data
            const list = await Lists.findByIdAndUpdate(id, req.body, { new: true });
    
            // If the film does not exist, throw a 404 error
            if (!list) {
                throw createError(404, 'List does not exist');
            }
    
            // Respond with a JSON object containing the updated film
            res.json({ success: true, data: list });
        } catch (error) {
            // Handle errors (e.g., invalid ID) and pass to the error-handling middleware
            console.error(error.message);
            if (error instanceof mongoose.CastError) {
                next(createError(400, "Invalid list ID"));
                return;
            }
            next(error);
        }
    },
}