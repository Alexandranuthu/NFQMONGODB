const express = require('express');
const app = express(); //reps the express application
const bodyParser = require("body-parser");
const dotenv = require('dotenv');
dotenv.config();
const cors = require('cors');
const routes = require('./routes/userRoute');
const router = require('./routes/filmRoutes');
const route = require('./routes/platformRoutes')
const listRoute = require('./routes/listsRoutes');
const watchlistRoute = require('./routes/watchlistRoutes');
const genreRoute = require('./routes/genreRoutes');
const searchRoute = require('./routes/searchRoutes');
const path = require('path');
const multer = require('multer');
const Platform = require('./model/platformModel');


app.use(cors({
  origin: "http://localhost:3000",
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true,
}));

// Body parser middleware
app.use(bodyParser.json());
app.use(express.json());

// Routes
app.use(routes);
app.use(router);
app.use(route);
app.use(listRoute);
app.use(watchlistRoute);
app.use(genreRoute);
app.use(searchRoute);

// app.use('/Posters', express.static(path.join(__dirname, 'public', 'Posters')));

const storageEngine = multer.diskStorage({
  destination: "./avatars",
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}--${file.originalname}`);
  },
});

const upload = multer({
  storage: storageEngine,
  limits: { fileSize: 1000000 },
  fileFilter: (req, file, cb) => {
    checkFileType(file, cb);
  }
});

const checkFileType = function (file, cb) {
  //Allowed file extensions
  const fileTypes = /jpeg|jpg|png|gif|svg/;

  //check extension names
  const extName = fileTypes.test(path.extname(file.originalname).toLowerCase());

  const mimeType = fileTypes.test(file.mimetype);

  if (mimeType && extName) {
    return cb(null, true);
  } else {
    cb("Error: You can Only Upload Images!!");
  }
};

app.post("/single", upload.single("image"), (req, res) => {
  if (req.file) {
    res.send("Single file uploaded successfully");
  } else {
    res.status(400).send("Please upload a valid image");
  }
});

app.post("/multiple", upload.array("images", 5), (req, res) => {
  if (req.files) {
    res.send("Muliple files uploaded successfully");
  } else {
    res.status(400).send("Please upload a valid images");
  }
});
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
  console.log(`Server is successfully running on ${PORT} rejoice!`);
});
