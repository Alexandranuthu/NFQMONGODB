const express = require('express');
const routes = express.Router();

const userController = require("../controller/userController")
try{
    routes.post('/register/addUserStep1', userController.addUserStep1);
    routes.post('/register/addUserStep2/:email', userController.addUserStep2);
    routes.delete('/register/:id', userController.deleteUser);
    routes.patch('/register/:id', userController.updateUser);
    routes.post('/login',  userController.login);
    routes.get('/getUser/:id', userController.getUser);
routes.post('/register/profile/setup', userController.setupProfile);
routes.get('/register/profile/:username', userController.getProfile);
}catch(err){
    console.error(err)
}


module.exports= routes;