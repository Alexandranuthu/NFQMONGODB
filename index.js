//import the expressjs library and create an instance of the express app
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
//import the environmental variables
const dotenv = require('dotenv');
dotenv.config();

const routes = require('./routes/userRoute');
app.use(bodyParser.json());
app.use(routes);


//set-up for the port server
const PORT = process.env.PORT || 4000;
require('./helpers/init_mongodb')
//starting the express.js server to listen on the specified port
app.listen(PORT, ()=>{
    console.log(`server is successfully running on ${PORT}`)
})