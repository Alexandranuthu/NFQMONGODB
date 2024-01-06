const JWT = require('jsonwebtoken');
const createError = require ('http-errors');
const config  = require('../config/config');
const user = require('../model/userModel');
module.exports = {
    signAccessToken: (userId, username, isAdmin) => {
        // Function to sign an access token
        return new Promise((resolve, reject) => {
            const payload = {
                userId: userId,
                username: username,
                isAdmin: isAdmin,
            };
            const secret = process.env.ACCESS_TOKEN_SECRET;
            const options = {
                expiresIn: config.accessTokenExpiration,
                issuer: 'NairoFilmQuest.com',
                audience: userId,    // audience: JSON.stringify(payload), // Change this line
            };
    
            JWT.sign(payload, secret, options, (error, token) => {
                if (error) {
                    console.error(error.message);
                    reject(createError.InternalServerError());
                }
                resolve(token);
            });
        });
    },
    
//middleware function to verify the access token
verifyAccessToken: (req, res, next) => {
    if (!req.headers['authorization']) return next(createError.Unauthorized());

    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader.split(' ');
    const token = bearerToken[1];

    if (bearerToken.length !== 2 || bearerToken[0] !== 'Bearer') {
        return next(createError.Unauthorized());
    }

    JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
        if (err) {
            console.error('Error verifying access token:', err.message);
            return next(createError.Unauthorized());
        }
    
        console.log('Token Payload:', payload);

        
    
        // Extract user ID from the first element of the audience array
        const userId = payload.userId;
        const isAdmin = payload.userisAdmin;
    
        // Check if user ID is present
        if (!userId ) {
            return next(createError.Unauthorized('Invalid token payload'));
        }
    
        // Assign the user ID to req.user
        req.user = { id: userId, isAdmin: isAdmin }; // assuming 'id' is the property you need
    
        next();
    });

},


    
    //function to assign a refresh token
    signRefreshToken:(UserId)=>{
        return new Promise((resolve, reject)=>{
            const payload = {};
            const secret = process.env.REFRESH_TOKEN_SECRET;
            const options = {
                expiresIn:config.refreshTokenExpiration,
                issuer: 'NairoFilmQuest.com',
                audience: UserId
            };
            JWT.sign(payload, secret, options, (error, token) => {
                if (error){
                    console.error(error.message);
                    reject(createError.InternalServerError());
                }
                resolve(token);
              });
    
        })
    },
    //middleware function to verify the refresh token
    verifyRefreshToken: (refreshToken) => {
        return new Promise((resolve, reject) => {
          JWT.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, payload) => {
            if (err) return reject(createError.Unauthorized());
            const userId = payload.aud;
            resolve(userId);
          });
        });
      }
}