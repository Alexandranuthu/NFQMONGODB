const Film = require('../model/filmModel');
const createError = require('http-errors');
const path = require('path');
module.exports = {
    // Controller function to get all films
    getFilms: async (req, res, next) => {
        try {
            // Fetch all films from the database
            const films = await Film.find();

            // Map films and add the full path to the poster image
            const filmsWithPosterPaths = films.map((film) => ({
                ...film.toJSON(),
                posterImagePath: `/Posters/${film.posterImagePath}`
            }));

            // Respond with a JSON object containing the films
            res.json({ success: true, data: filmsWithPosterPaths });
        } catch (error) {
            // Handle errors and respond with an error message
            console.error('Error fetching films:', error);
            res.status(500).json({ success: false, error: 'Internal Server Error' });
        } 
    },

    // Controller function to add a new film
    addFilm: async (req, res) => {
        // Create a new Film instance with data from the request body
        const film = new Film(req.body);
        const {title} = req.body;
        
        try {
            // Save the new film to the database
            const newFilm = await film.save();
            const existingFilm = await Film.findOne({ title });
            
            if(existingFilm) {
                return res.status(409).json({success:false, message: 'Film already exists'});
            }

            // Respond with a JSON object containing the new film
            res.status(201).json({ success: true, data: newFilm });
        } catch (error) {
            // Handle errors (e.g., validation error) and respond with an error message
            res.status(400).json({ success: false, message: error.message });
        }
    },

    // Controller function to delete a film by ID
    deleteFilm: async (req, res, next) => {
        // Extract the film ID from the request parameters
        const id = req.params.id;

        try {
            // Find and delete the film with the specified ID
            const film = await Film.findByIdAndDelete(id);

            // If the film does not exist, throw a 404 error
            if (!film) {
                throw createError(404, 'Film does not exist');
            }

            // Respond with a JSON object containing the deleted film
            res.json({ success: true, data: film });
        } catch (error) {
            // Handle errors (e.g., invalid ID) and pass to the error-handling middleware
            console.error(error.message);
            if (error instanceof mongoose.CastError) {
                next(createError(400, "Invalid film id"));
                return;
            }
            next(error);
        }
    },
    getFile: async (req, res, next) => {
        try {
          const filePath = path.join(__dirname, 'public', 'Posters', req.params.path);
          res.download(filePath);
        } catch (error) {
          // Handle errors appropriately
          console.error(error);
          res.status(500).send('Internal Server Error');
        }
      },
      // Controller function to update a film by ID
updateFilm: async (req, res, next) => {
    // Extract the film ID from the request parameters
    const id = req.params.id;

    try {
        // Find the film by ID and update its data
        const film = await Film.findByIdAndUpdate(id, req.body, { new: true });

        // If the film does not exist, throw a 404 error
        if (!film) {
            throw createError(404, 'Film does not exist');
        }

        // Respond with a JSON object containing the updated film
        res.json({ success: true, data: film });
    } catch (error) {
        // Handle errors (e.g., invalid ID) and pass to the error-handling middleware
        console.error(error.message);
        if (error instanceof mongoose.CastError) {
            next(createError(400, "Invalid film ID"));
            return;
        }
        next(error);
    }
},

};
