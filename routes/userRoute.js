const express = require('express');
const routes = express.Router();
const {verifyAccessToken} = require('../helpers/jwtHelper');

const userController = require("../controller/userController");
const auth = require("../controller/auth");
try{
    routes.post('/register/addUserStep1', userController.addUserStep1);
    routes.post('/register/addUserStep2/:email', userController.addUserStep2);
    routes.delete('/delete/:id', verifyAccessToken,userController.deleteUser);
    routes.put('/update/:id', verifyAccessToken, userController.updateUser);
    routes.post('/login',  auth.login);
    routes.get('/find/:id', userController.getUser);
    routes.post('/register/profile/setup', userController.setupProfile);
    routes.get('/register/profile/:username', userController.getProfile);
    routes.get('/find', verifyAccessToken, userController.getAllUsers);
    routes.get('/stats', userController.userStats)
}catch(err){
    console.error(err)
}


module.exports= routes;