const mongoose = require('mongoose')

const filmSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    director: {
        type: String,
        required: true
    },
    synopsis: {
        type: String,
        required: true
    },
    whereToWatch: [{
        platform: { type: String, required:true},
        link: {type: String, required: true},
    }]
})
const Film = mongoose.model('Film', filmSchema);
module.exports = Film;