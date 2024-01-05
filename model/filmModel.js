const mongoose = require('mongoose')

const filmSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    synopsis: {
        type: String,
        required: true
    },
    director: {
        type: String,
        required: true
    },
    whereToWatch: [{
        platform: { type: mongoose.Schema.Types.ObjectId, ref:'Platform', required:true},
        link: {type: String, required: true},
    }],
    ratings: [{ 
        user: {type: String, required: true },
        rating:{ type: Number},
        review: {type: String}
     }],
    posterImagePath: {
        type: String,  // Store the path to the image file
        required: true
    },
    runtime: {
        type: String,
        required: true
    },
    genre:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:'Genre', 
        required:true,
    }],
    cast:[{
        type: String,
        required: true
    }],
    agerating:{
        type: String,
        required:true
    },
    releaseyear:{
        type:Number,
        required:true,
    },
    trailers: [{
        link: {type: String, required: true},
    }]
})
const Film = mongoose.model('Film', filmSchema);
module.exports = Film;