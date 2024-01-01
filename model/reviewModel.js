const mongoose = require('mongoose');//is Object Data Modelling that helps you create and manage MONGODB objects in Node.js apps
//uses Encapsulation and abstraction
const reviewSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required:true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    filmId:{
        type: String,
        required: true,
    },
    rating:{
        type: Number,
        required:true
    },
    mediaType:{
        type: String,
        enum: ["film", "series"],
        required:true,
    },
    mediaPoster:{
        type: String,
        required: true
    },
    likes:{
        type: Number,
        default: 0,
    },
    dislikes:{
        type: Number,
        default: 0,
    },
    reviewText:{
        type: String,
        required: true
    },
    createdAt:{
        type: Date,
        default:Date.now
    }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;