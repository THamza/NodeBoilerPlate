"use strict";

console.log("Starting server");

require("./config/config");

const createError = require('http-errors');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const appAuthRouter = require('./routes/app-auth');
const conversationRouter = require('./routes/conversations');
const commentRouter = require('./routes/comments');

var expressValidator = require("express-validator");

const mongoose = require('mongoose');

mongoose.connect(process.env.DB_URL, { useNewUrlParser: true });
// mongoose.connect('mongodb+srv://FYEEventManager:FYE2019@devfyeeventmanager-uadh0.mongodb.net/test?retryWrites=true&w=majority&authSource=yourDB&w=1');
// mongoose.connect('mongodb+srv://FYEDev:FYE2019@cluster0-uadh0.mongodb.net/test?retryWrites=true&w=majority');


// const MongoClient = require('mongodb').MongoClient;
// const uri = "mongodb+srv://FYEDev:FYE2019@cluster0-uadh0.mongodb.net/test?retryWrites=true&w=majority";
// const client = new MongoClient(uri, { useNewUrlParser: true });
// client.connect(err => {
//     console.log(err);
// });


var app = express();

app.use(expressValidator());
app.use(bodyParser.json());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', appAuthRouter);
app.use('/conversations', conversationRouter);
app.use('/comments', commentRouter);

app.listen(process.env.PORT || 8080, () => {
  console.log("Listening on port " + process.env.PORT)
})


//Detect JSON format error
app.use((error, req, res, next) => {
  if(error instanceof SyntaxError) {
      res.status(400)
          .json({
              "status": "error",
              "message":"invalid json request format"
          });
  }else{
      next();
  }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
