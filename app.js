
var express = require('express');
const uuid = require('uuid/v4');
var app = express();
const session = require('express-session');
const FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
var ObjectId = require('mongodb').ObjectID;

const url = 'mongodb://localhost:27017';
const dbName = 'stellite-funding-platform';

passport.use(new LocalStrategy(
  { usernameField: 'email' },
  (email, password, done) => {
    const checkLogin = function(db, callback) {
      const collection = db.collection('users');
      collection.find({'email': email}).toArray(function(err, data) {
        assert.equal(err, null);
        const user = data[0];
        if(email === user.email && password === user.password) {
          return done(null, user);
        }
      });
    }
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
      assert.equal(null, err);
      const db = client.db(dbName);
      checkLogin(db, function() {
        client.close();
      });
    });
  }
));

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((_id, done) => {
  done(null, _id);
});


app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(session({
  genid: (req) => {
    return uuid();
  },
  store: new FileStore(),
  secret: 'a secret random string',
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});
app.get('/login', function(req, res) {
  if(req.isAuthenticated()) {
    res.send('Logged');
  } else {
    res.sendFile(__dirname + '/index.html');
  }
});
app.get('/about', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});


app.get('/logged', function(req, res) {
  if(req.isAuthenticated()) {
    const checkLogged = function(db, callback) {
      const collection = db.collection('users');
      collection.find(ObjectId(req.user)).toArray(function(err, data) {
        assert.equal(err, null);
        res.send({ user_username: data[0].username });
      });
    }
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
      assert.equal(null, err);
      const db = client.db(dbName);
      checkLogged(db, function() {
        client.close();
      });
    });
  } else {
    res.send('false')
  }
});

// Useful for later code
//
// app.post('/login', (req, res) => {
//   var email = req.body.email, password = req.body.password;
//   res.send("You posted email: "+ email +" & password: "+ password +" to the login page!\n");
//   console.log(req.sessionID);
// });

app.post('/login',
passport.authenticate('local', { failureRedirect: '/login' }),
function(req, res) {
  res.send('Logged');
});
app.get('/logout', function (req, res){
  req.session.destroy(function (err) {
    res.redirect('/login');
  });
});

app.use(express.static('public'));
app.listen(3000);
