const mongoose = require('mongoose');
const User = require('../model/userModel');
const createError = require('http-errors');
const bcrypt = require ('bcrypt');
const { authSchema } = require('../auth/auth_schema');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../helpers/jwtHelper');
const JWT = require()

module.exports = {
    addUser: async (req, res, next) => {
        try {
            // Extract user registration data from the request body
            const { email, password } = req.body;
               const result = await authSchema.validateAsync(req.body);
   
               const Exists = await User.findOne({email: email})
   
               if (Exists) throw createError.Conflict(`${email} is already been registered`)
               const user = new User(result)
   
            const savedUser = await user.save()
            const accessToken = await signAccessToken(savedUser.id)

            console.log('Access Token:', accessToken);
        
            res.json({ signAccessToken, signRefreshToken, message: 'User added successfully' });
   
        } catch (error) {
               if(error.isJoi === true)error.status = 422
               next(error)
        }
    },
    updateUser: async (req, res, next) => {
            const { username, email, password } = req.body
            const id = req.params.id //extracting the id from the request parameters
        try{
            if(password) {
                const hashedPassword = await bcrypt.hash(password, 10);

                await User.findByIdAndUpdate(
                    id,
                    {
                        username,
                        email,
                        password : hashedPassword,
                    },
                    {new: true}
                );
            } 
            res.send("user updated successfully");
        }catch(error){
            console.log(error.message)
            next(error);
        }
        },
    deleteUser: async (req, res, next) => {
        const id = req.params.id //extracting the id from the request parameters
        try{
            const user = await User.findByIdAndDelete(id);
            if(!user){
                throw createError(404, 'User does not exist')
            }
            res.send(user);
        }catch(error){
            console.error(error.message)
            if (error instanceof mongoose.CastError){
                next(createError(400, "Invalid user id"));
                return;
            }
            next(error);
        }
    },
    //Login controller function
    login: async (req, res, next)=>{
        try{
            //valiate the request body using the authentication schema
            const result = await authSchema.validateAsync(req.body);

            //Finding the user by email in the database
            const user = await User.findOne({ email: result.email });

            //If user is not found, throw a "Not" found error
            if(!user){
                throw createError.NotFound('User not registered');
            }
            //Checking if the provided password matches with the stored one in the database
            const validPassword = await bcrypt.compare(result.password, user.password);
            //if the passwords do not match, throw an unauthorized error
            if (!validPassword) throw createError.Unauthorized('Invalid username/password combination');
            //if valid,Create and assign a token to the user
            const accessToken = await jwtHelper.signAccessToken(user.id);
            const refreshToken = await jwtHelper.signRefreshToken(user.id);

            //send the access and refresh token in the response
            res.send({ accessToken, refreshToken});
        }catch(error){
            //if a joi val error occurs, return a bad request error
            if (error.isJoi === true)
            return next(createError.BadRequest('Invalid username/password'));
            //pass other error to the next middle ware for handling
            next(error);
        }
    }
};