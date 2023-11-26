const mongoose = require('mongoose');//is Object Data Modelling that helps you create and manage MONGODB objects in Node.js apps
//uses Encapsulation and abstraction
const watchlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required:true
    },
    filmId:{
        type: String,
        required: true,
    },
    addedAt:{
        type: Date,
        default:Date.now
    }
});

const Watchlist = mongoose.model('Watchlist', watchlistSchema);

module.exports = Watchlist;