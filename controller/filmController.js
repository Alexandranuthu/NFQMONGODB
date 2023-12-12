const Film = require('../model/filmModel');

module.exports = {
    getFilm: async (req, res, next) => {
        try {
            const films = await Film.find();
            const filmsWithPosterPaths = films.map((film) => ({
              ...film.toJSON(),
              poster: `/Posters/${film.poster}`, // Construct the full path to the poster image
            }));
            res.json(filmsWithPosterPaths);
          } catch (error) {
            console.error('Error fetching films:', error);
            res.status(500).json({ error: 'Internal Server Error' });
          } 
    },
    addFilms:  async(req, res)=> {
        const film = new Film(req.body);
        try{
            const newFilm = await film.save();
            res.status(201).json(newFilm);
        }catch (error) {
            res.status(400).json({message: error.message});
        }
    },
}