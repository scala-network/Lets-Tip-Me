
var Ddos = require('ddos')
var express = require('express')
var ddos = new Ddos({burst:50, limit:55});
var app = express();
app.use(ddos.express)
const session = require('express-session');
const uuid = require('uuid/v4');
const FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
var ObjectId = require('mongodb').ObjectID;
const bcrypt = require('bcrypt');
const saltRounds = 10;

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
        if (data[0]){
          const user = data[0];
          if(email === user.email) {
            // Check password
            bcrypt.compare(password, user.password, function(err, res) {
                if(res === true) {
                //Local strategy returned true
                return done(null, user);
                } else if(res === false) {
                return done(null, false, "Wrong password");
                }
            });
          }
        } else {
        return done(null, false, "Email not found");
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
app.get('/register', function(req, res) {
  if(req.isAuthenticated()) {
    res.send('Logged');
  } else {
    res.sendFile(__dirname + '/index.html');
  }
});
app.get('/about', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.post('/register', function (req, res) {
  function ValidateEmail(inputText)
  {
    var mailformat = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    if(inputText.match(mailformat))
    {
      return true;
    }
    else
    {
      return false;
    }
  }
  function ValidateUsername(inputText)
  {
    var usernameformat = /^([a-zA-Z0-9_-]+)$/;
    if(inputText.match(usernameformat))
    {
      return true;
    }
    else
    {
      return false;
    }
  }
  if(req.isAuthenticated()) {
    res.send('Logged');
  } else {
    var username = req.body.username, email = req.body.email, password = req.body.password, passwordcheck = req.body.passwordcheck;
    if(password!=passwordcheck){
    res.send("Different passwords");
    } else if(ValidateEmail(email)==false){
    res.send("Invalid email address");
    } else if(ValidateUsername(username)==false){
      res.send("Invalid username, allowed: a-z, A-Z, 0-9, underscore and dash");
    } else if(username.lenght>20){
      res.send("Too long username");
    } else if(email.lenght>320){
      res.send("Too long email address");
    } else if(password.lenght>256){
      res.send("Too long password");
    } else {
    const insertDCreatedAccount = function(db, callback) {
      const collection = db.collection('users');
      bcrypt.hash(password, saltRounds, function(err, hash) {
        collection.insertOne( { username: username, email: email, password: hash }, function(err, result) {
          assert.equal(err, null);
          res.send("Registered");
        });
      });
    }
    MongoClient.connect(url,  { useNewUrlParser: true }, function(err, client) {
      assert.equal(null, err);
      const db = client.db(dbName);
      insertDCreatedAccount(db, function() {
        client.close();
      });
    });
    }
  }
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

app.post('/login', function(req, res, next) {
  passport.authenticate('local', function(err, user, info) {
    if (err) { return next(err); }
    if (!user) { return res.send(info); }
    req.logIn(user, function(err) {
      if (err) { return next(err); }
      return res.send('Logged');
    });
  })(req, res, next);
});

app.get('/logout', function (req, res){
  req.session.destroy(function (err) {
    res.redirect('/login');
  });
});

app.use(express.static('public'));
app.listen(3000);
