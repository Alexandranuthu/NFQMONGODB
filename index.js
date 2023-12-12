const express = require('express');
const app = express(); //reps the express application
const bodyParser = require("body-parser");
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const routes = require('./routes/userRoute');
const router = require('./routes/filmRoutes');
const path = require('path');


app.use(cors({
  origin: "http://localhost:3000",
}));

// Body parser middleware
app.use(bodyParser.json());

// Routes
app.use(routes);
app.use(router);
app.use('/posters', express.static(path.join(__dirname, 'Posters')));

// Handling 404 error
app.use((req, res, next) => {
  const err = new Error("Not found");
  err.status = 404;
  next(err);
});

// Error Handler
app.use((err, req, res, next) => {
  res.status(err.status || 500).send({
    error: {
      status: err.status || 500,
      message: err.message
    }
  });
});

// Set up for the port server
const PORT = process.env.PORT || 4000;

// Initialize MongoDB (assuming this file exports a function that initializes MongoDB)
require('./helpers/init_mongodb');

// Start the Express.js server to listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is successfully running on ${PORT}`);
});
