const express = require('express');
const routes = express.Router();

const userController = require("../controller/userController")
try{
    routes.post('/register', userController.addUser);
    routes.delete('/register/:id', userController.deleteUser);
    routes.patch('/register/:id', userController.updateUser);
    routes.post('/login',  userController.login);
    routes.get('/register', userController.getUser);
routes.post('/register/profile/setup', userController.setupProfile);
routes.get('/register/profile/:username', userController.getProfile);
}catch(err){
    console.error(err)
}


module.exports= routes;