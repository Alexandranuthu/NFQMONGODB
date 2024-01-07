const mongoose = require('mongoose');
const User = require('../model/userModel');
const Film = require('../model/filmModel');
const createError = require('http-errors');
const bcrypt = require ('bcrypt');
const { authSchema } = require('../auth/auth_schema');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../helpers/jwtHelper');
const JWT = require('jsonwebtoken');
const { config } = require('dotenv');
const jwtHelper = require('../helpers/jwtHelper')


module.exports = {
    addUserStep1: async (req, res) => {
            try{
                //extracting the basic information from the request body
                const 
                { username, email, password, birthday} = req.body;
                const result = await authSchema.validateAsync({
                    username,
                    email,
                    password,
                });

                const exists = await User.findOne({ email});

                if (exists) {
                    throw createError.Conflict(`${email} is already registered`);
                }
                //save user with basic information first
                const user = await new User(result);
                const savedUser = await user.save();

                //to generate a token for the next step
                const accessToken = await signAccessToken(savedUser.id, savedUser.username, true);
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
            const result = await User.findById(id).populate({
                path: 'favorites',
                select: 'title synopsis'
            })
            .populate({
                path: 'watchlist',
                select: 'user films watched'
            });
            res.send(result); // Sending the result as the response
        } catch (error) {
            console.error(error);
            res.status(500).send("Internal Server Error");
        }
    },
    getAllUsers: async (req, res) => {
        const query = req.query.new;
    
        // if (req.user && req.user.isAdmin === true) {  // Use req.user.isAdmin to check for admin access
        if(true){
            try {
                const users = query ? await User.find().sort({ _id: -1 }).limit(10) : await User.find();
                console.log('req.user.isAdmin:', req.user.isAdmin);
                res.status(200).json(users); // Sending the result as the response
            } catch (error) {
                console.error(error);
                res.status(500).send("Internal Server Error" + error.message);
            }
        } else {
            res.status(403).json("You are not allowed to see all users");
        }
    },
    
    updateUser: async (req, res, next) => {
        const id = req.params.id; // extracting the id from the request parameters
        const { username, email, password } = req.body;
        let result; // declare result variable outside the if block
    
        try {
            if (req.user.id === req.params.id || req.user.isAdmin) {
                if (password) {
                    const hashedPassword = await bcrypt.hash(password, 10);
    
                    result = await User.findByIdAndUpdate(
                        id,
                        {
                            username,
                            email,
                            password: hashedPassword,
                        },
                        { new: true }
                    );
                    if (!result) {
                        throw createError(404, 'User does not exist');
                    }
                } else {
                    // Handle the case when password is not provided
                    result = await User.findByIdAndUpdate(
                        id,
                        {
                            username,
                            email,
                        },
                        { new: true }
                    );
                    if (!result) {
                        throw createError(404, 'User does not exist');
                    }
                }
                console.log('Requesting user ID:', req.user.id);
                console.log('Target user ID:', id);
        
                res.json({ success: true, data: result });
            } else {
                throw createError(403, 'Unauthorized: You do not have permission to update this user.');
            }
        } catch (error) {
            console.log(error.message);
            next(error);
        }
    },
    
    deleteUser: async (req, res, next) => {
        const id = req.params.id; // extracting the id from the request parameters
        const { username, email, password } = req.body;
        let result; // declare result variable outside the if block
    
        try {
            if (req.user.id === req.params.id || req.user.isAdmin) {
                if (password) {
                    const hashedPassword = await bcrypt.hash(password, 10);
    
                    result = await User.findByIdAndDelete(
                        id,
                        {
                            username,
                            email,
                            password: hashedPassword,
                        },
                        { new: true }
                    );
                    if (!result) {
                        throw createError(404, 'User does not exist');
                    }
                } else {
                    // Handle the case when password is not provided
                    result = await User.findByIdAndDelete(
                        id,
                        {
                            username,
                            email,
                        },
                        { new: true }
                    );
                    if (!result) {
                        throw createError(404, 'User does not exist');
                    }
                }
                console.log('Requesting user ID:', req.user.id);
                console.log('Target user ID:', id);
        
                res.json({ success: true, data: result });
            } else {
                throw createError(403, 'Unauthorized: You do not have permission to delete this user.');
            }
        } catch (error) {
            console.log(error.message);
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
      },

      userStats: async (req, res, next) => {
            const today = new Date();
            const lastYear = today.setFullYear(today.setFullYear() -1);

            const monthsArray = [
                "January",
                "February",
                "March",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December"
            ];

            try{
                const data = await User.aggregate([
                    {
                        $project:{
                            month: {$month: "$createdAt"}
                        }
                    },{
                        $group: {
                            _id: "$month",
                            total:{$sum: 1},
                        }
                    }
                ]);
                res.status(200).json(data);
            }catch(err){
                res.status(500).json(err)
            }
      },
      addToFavorites: async(req, res, next) => {
        const userId = req.user.id;
        const filmId = req.params.filmId;
    
        try{
            const film = await Film.findById(filmId);
            if(!film) {
                throw createError(404, 'Film not found');
            }
    
            const user = await User.findByIdAndUpdate(
                userId,
                {$addToSet: {favorites: filmId}}, //add to set ensures uniqueness
                {new: true}
            );
            res.json({success: true, data: user});
        }catch (error) {
            console.error(error);
            res.status(500).json({success: false, error: 'Internal server error'});
        }
    },
    addWatchlist: async (req, res, next) => {
        try {
            // Extract movie details from the request body

            console.log('req.user:', req.user);
            console.log('req.body', req.body);


            const { filmId } = req.body;

            if (!req.user.id) {
                throw createError(401, 'Unauthorized');
            }
            
            // Create a new watchlist item
            const newWatchlistItem = new Watchlist({
                user: req.user.id, // Use the correct way to get the authenticated user's ID
                films: [{film : filmId}], // Use the filmId received from the request body
            });

            // Save the new watchlist item to the database
            const savedWatchlistItem = await newWatchlistItem.save();

            // Send a success response
            res.status(200).json({
                 success: true,
                message: 'Movie added to watchlist successfully', 
                watchlistItem: savedWatchlistItem });
        } catch (error) {
            console.error('Error adding movie to watchlist:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Internal server error' });
        }
},
};