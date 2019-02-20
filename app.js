
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

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'stellite-funding-platform';

// Configure passport.js to use the local strategy
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  (email, password, done) => {
    //Inside local strategy callback
    // Use connect method to connect to the server
    const checkLogin = function(db, callback) {
      // Get the documents collection
      const collection = db.collection('users');
      // Find some documents
      collection.find({'email': email}).toArray(function(err, data) {
        assert.equal(err, null);
        const user = data[0];
        if(email === user.email && password === user.password) {
          //Local strategy returned true
          return done(null, user);
        }
      });
    }

    MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
      assert.equal(null, err);
      //Connected successfully to MongoDB server
      const db = client.db(dbName);
      checkLogin(db, function() {
        client.close();
      });
    });
  }
));

// Tell passport how to serialize the user
passport.serializeUser((user, done) => {
  //Inside serializeUser callback. User id is save to the session file store here
  done(null, user._id);
});

passport.deserializeUser((_id, done) => {
  //Inside deserializeUser callback
  //The user id passport saved in the session file store is: _id
  done(null, _id);
});


// Add & configure middleware
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(session({
  genid: (req) => {
    //Inside session middleware genid function
    //Request object sessionID from client: ${req.sessionID}
    return uuid(); // Use UUIDs for session IDs
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
      // Get the documents collection
      const collection = db.collection('users');
      // Find some documents
      collection.find(ObjectId(req.user)).toArray(function(err, data) {
        assert.equal(err, null);
        res.send({ user_username: data[0].username });
      });
    }

    MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
      assert.equal(null, err);
      //Connected successfully to MongoDB server
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
