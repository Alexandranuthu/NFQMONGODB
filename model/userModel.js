const mongoose = require('mongoose');//is Object Data Modelling that helps you create and manage MONGODB objects in Node.js apps
const bcrypt = require("bcrypt");
//uses Encapsulation and abstraction
const UserSchema = new mongoose.Schema({
    username:{
        type: String,
        required: true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
        unique:true
    },
    //we will use getter setter for this field to hide the password from being exposed in JSON representation of user object
    location:{
        address : {type:String},
    },
    diplayName:{
        type: String,
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'non-binary', 'other'],
    },
    birthday:{
        year:{
            type:Number,
            required:true,
        },
        month: {
            type: String,
            enum: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October','November', 'December'], 
            required: true,
        },
        day:{
            type: Number,
            required: true,
        }
    },
    profilePicture: {
        type: String,
    },
    Bio:{
        type:String,
    },
    createdAt:{
        type:Date,
        default:Date.now
    },
    updatedAt:{
        type:Date,
        default:Date.now
    }
});

//hashing pwd before saving the data in the database
UserSchema.pre('save', async function(next){
    try{
        const salt = await bcrypt.genSalt(10)
        if(this.isModified('password')){
            const hashedPwd = await bcrypt.hash(this.password, salt)
            this.password=hashedPwd;
        }
        next()
    }catch (error){
        next(error)
    }
})

//comparing password if its entered or valid
UserSchema.methods.isValidPassword =async function(password){
    try {
        return await bcrypt.compare(password, this.password);
    }catch(error){
        throw error;
    }
}
UserSchema.virtual('age').get(function() {
    if (this.birthday && this.birthday.year) {
        const currentYear = new Date().getFullYear();
        return currentYear - this.birthday.year;
    }
    return null;
})

const User = mongoose.model('User', UserSchema);

module.exports = User;//exporting the model not the schema