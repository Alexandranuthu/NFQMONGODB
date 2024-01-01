const mongoose = require('mongoose');
const User = require('../model/userModel');
const createError = require('http-errors');
const bcrypt = require ('bcrypt');
const { authSchema } = require('../auth/auth_schema');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../helpers/jwtHelper');
const JWT = require('jsonwebtoken');
const { config } = require('dotenv');
const jwtHelper = require('../helpers/jwtHelper')


module.exports = {
    // addUser: async (req, res, next) => {
    //     try {
    //         // Extract user registration data from the request body
    //         const { username,email, password } = req.body;
    //            const result = await authSchema.validateAsync(req.body);
   
    //            const Exists = await User.findOne({email: email})
   
    //            if (Exists) throw createError.Conflict(`${email} is already been registered`)
    //            const user = new User(result)
   
    //         const savedUser = await user.save()
    //         const accessToken = await signAccessToken(savedUser.id)
    //         const refreshToken = await signRefreshToken(savedUser.id)

    //         console.log('Access Token:', accessToken);
    //         console.log('Refresh Token:', refreshToken);
        
    //         res.json({ accessToken, refreshToken, message: 'User added successfully' });

   
    //     } catch (error) {
    //            if(error.isJoi === true)error.status = 422
    //            next(error)
    //     }
    // },
    addUserStep1: async (req, res) => {
            try{
                //extracting the basic information from the request body
                const { username, email, password} = req.body;
                const result = await authSchema.validateAsync(req.body);

                const exists = await User.findOne({ email });

                if (exists) {
                    throw createError.Conflict(`${email} is already registered`);
                }
                //save user with basic information first
                const user = await new User(result);
                const savedUser = await user.save();

                //to generate a token for the next step
                const accessToken = await signAccessToken(savedUser.id);
                const refreshToken = await signRefreshToken(savedUser.id);

                console.log('User Created Successfully', savedUser);

                //redirecting the user to the second step with the token
                const redirectUrl = `addUserStep2?token=${accessToken}`;
                res.json({ accessToken, refreshToken, message: 'User added successfully', redirectUrl });
            }catch (error) {
                if (error.isJoi === true) error.status = 422;
                console.error('Error in step 1:', error);
                res.status(500).json({success: false, error: 'Internal Server Error'});
            }
    },
    addUserStep2: async (req, res) => {
        const addUserStep2 = async (email,displayname, age, gender, location, profilePicture) => {
            try {
                // Your logic to update the user with additional information and profile picture
                const updatedUser = await User.findOneAndUpdate(
                    { email },
                    { displayname,age, gender, location, profilePicture },
                    { new: true }
                );
    
                if (!updatedUser) {
                    throw createError.NotFound('User not found');
                }
    
                console.log('User updated successfully:', updatedUser);
            } catch (error) {
                console.error('Error updating user profile:', error.message);
                throw error; // Rethrow the error for higher-level handling
            }
        };
    
        try {
            const { email,displayname, age, gender, location } = req.body;
            const profilePicture = req.file ? req.file.filename : null;
            // Updating the user with additional information
            await addUserStep2(email,displayname, age, gender, location, profilePicture);
    
            res.json({
                success: true,
                message: 'User Registration Completed'
            });
        } catch (error) {
            console.error('Error in step 2:', error);
            res.status(500).json({
                success: false,
                error: 'Internal Server Error'
            });
        }
    },
    
    getUser:  async (req, res) => {
        try {
            const id = req.params.id //extracting the id from the request parameters
            const result = await User.findById(id);
            res.send(result); // Sending the result as the response
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    },
    updateUser: async (req, res, next) => {
        const id = req.params.id //extracting the id from the request parameters
            const { username, email, password,displayName, location, gender, birthday } = req.body
            
        try{
            if(password) {
                const hashedPassword = await bcrypt.hash(password, 10);

                await User.findByIdAndUpdate(
                    id,
                    {
                        username,
                        email,
                        displayName,
                        location,
                        gender,
                        birthday,
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
            console.error('Error deleting user profile:', error.message);
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
            res.send({ accessToken, refreshToken, message: 'login successfull'});
        }catch(error){
            //if a joi val error occurs, return a bad request error
            if (error.isJoi === true)
            return next(createError.BadRequest('Invalid username/password'));
            //pass other error to the next middle ware for handling
            next(error);
        }
    }, 
    setupProfile: async (req, res) => {
        try {
            const {userId, displayName, location, gender, birthday} = req.body;

            await User.findByIdAndUpdate(userId, {displayName, location,
            gender, birthday});

            res.status(200).json({
                success: true, message: 'User profile set up successfully'
            });
        }catch(error){
            console.error('Error setting up user profile:', error);
            res.status(500).json({success: false, message: 'Internal server error'});
        }
    },
    getProfile: async (req, res) => {
        try {
          const userId = req.params.userId;
      
          // Fetch user profile from the database
          const userProfile = await User.findById(userId);
      
          // Send the user profile as the response
          res.status(200).json({ success: true, data: userProfile });
        } catch (error) {
          console.error('Error getting user profile:', error);
          res.status(500).json({ success: false, message: 'Internal server error' });
        }
      }
};