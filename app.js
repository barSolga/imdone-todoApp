const express = require('express');
const pug = require('pug');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require("mongoose");
const flash = require('connect-flash');
const session = require('express-session');
const expressValidator = require('express-validator');
const passport = require('passport');
const app = express();

// global variables .env
require('dotenv').config();

// database connection
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@todo.rgw55.mongodb.net/todo?retryWrites=true&w=majority`);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () {
  console.log("Connected to database successfully");
});

// static folder
app.use(express.static(__dirname + '/public'));

// body-parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// pug middleware
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');

// express Session middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  maxAge: 24 * 60 * 60 * 1000,
}));

// express messages middleware
app.use(flash());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});

// express validator middleware
app.use(expressValidator({
    errorFormatter: function (param, msg, value) {
      var namespace = param.split('.')
        , root = namespace.shift()
        , formParam = root;
  
      while (namespace.length) {
        formParam += '[' + namespace.shift() + ']';
      }
      return {
        param: formParam,
        msg: msg,
        value: value
      };
    }
}));

// Passport config
require('./config/passport')(passport);
// Passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.get('*', (req, res, next) => {
  res.locals.user = req.user || null;
  next();
});

// ROUTES imports
const user = require('./routes/user');
// MODELS imports
const Todo = require('./models/todo');
const User = require('./models/user');

app.get('/', (req, res) => {
  Todo.find({}, (err, todos) => {
    if (err) return handleError(err);
    else {
      User.find({}, (err, users) => {
        if (err) return handleError(err);
        else {
          res.render('index', { 
            title: 'Simple TODO app', 
            users: users.length,
            todos: todos.length,
          });
        }
      });
    }
  });
});

// ROUTES
app.use('/user', user)


// 404 page
app.get('*', (req, res, next) => {
  res.status(404).render('404', {
      pageTitle: "Strona nie istnieje :("
  });
});

app.listen(process.env.PORT, () => {
    console.log(`App listening on port ${process.env.PORT}`)
});