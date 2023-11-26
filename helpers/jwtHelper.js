const JWT = require('jsonwebtoken');
const createError = require ('http-errors');
const config  = require('../config/config');
const User = require('../model/userModel');
module.exports = {
    signAccessToken:(UserId) => {
        //function to sign an access token
        return new Promise((resolve, reject)=>{
            const payload = {};
            const secret = process.env.ACCESS_TOKEN_SECRET;
            const options = {
                expiresIn: config.accessTokenExpiration,
                issuer: 'NairoFilmQuest.com',
                audience: UserId,
            };
    
            JWT.sign(payload, secret, options, (error, token)=>{//error token handle the result of the siging process
                if(error){
                    console.error(error.message);
                    reject(createError.InternalServerError());
                }
                resolve(token);
            });
        });
    },
        //middleware function to verify the access token
    verifyAccessToken:(req, res, next) => {
        if(!req.headers['authorization']) return next(createError.Unauthorized());
    
        const authHeader = req.headers['authorization'];
        const bearerToken = authHeader.split(' ');
        const token = bearerToken[1];
    
        JWT.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, payload) => {
            if(err){
                return next(createError.Unauthorized());
            }
    
            req.payload = payload;
            next();
        })
    },
    
    //function to sign a refresh token
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
