const mongoose = require('mongoose');
const User = require('../model/userModel');
const createError = require('http-errors');
const bcrypt = require ('bcrypt');
const { authSchema } = require('../auth/auth_schema');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../helpers/jwtHelper');
const JWT = require('jsonwebtoken');
const { config } = require('dotenv');
const jwtHelper = require('../helpers/jwtHelper')

//Login controller function
module.exports = {
    login: async (req, res, next)=>{
    try{
        //valdate the request body using the authentication schema
        const result = await authSchema.validateAsync(req.body);

        //Finding the user by email in the database
        const user = await User.findOne({ email: result.email });

        //If user is not found, throw an error
        if(!user){
            throw createError.NotFound('User not registered');
        }
        //Checking if the provided password matches with the stored one in the database
        const validPassword = await bcrypt.compare(result.password, user.password);
        //if the passwords do not match, it throw an unauthorized error
        if (!validPassword) throw createError.Unauthorized('Invalid username/password combination');
        //if valid,Create and assign a token to the user
        const accessToken = await jwtHelper.signAccessToken(
            user.id,
            user.username,
            user.isAdmin,
        );
        const refreshToken = await jwtHelper.signRefreshToken(user.id);

        //send the access and refresh token in the response
        res.send({
            user: {
                userId:user.id,
                username: user.username,
                isAdmin: user.isAdmin,
            },
            accessToken,
            refreshToken, 
            message: 'login successful'});
        console.log(`User ${user.username} logged in successfully`);

    }catch(error){
        //if a joi val error occurs, return a bad request error
        if (error.isJoi === true)
        return next(createError.BadRequest('Invalid username/password'));
        //pass other error to the next middle ware for handling
        next(error);
    }
}, 
}