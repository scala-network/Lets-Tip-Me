
var Ddos = require('ddos');
var express = require('express');
var ddos = new Ddos({burst:50, limit:55});
var app = express();
app.use(ddos.express);
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
const sendmail = require('sendmail')();
const keygen = require('keygen');

// Connection URL
const url = 'mongodb://localhost:27017';

// Database Name
const dbName = 'stellite-funding-platform';

// Hostname of your hosting
const hostname = "127.0.0.1:3000";
const noreply = "no-reply@stellite.cash"

//Inputs validators
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

function ValidateActivationCode(inputText)
{
  var activationcodeformat = /^([a-zA-Z0-9]+)$/;
  if(inputText.match(activationcodeformat))
  {
    return true;
  }
  else
  {
    return false;
  }
}

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
                if(user.activated === "true") {
                //Local strategy returned true
                return done(null, user);
                } else {
                return done(null, false, "Locked account, please check the email you received");
                }
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
app.get('/activate', function(req, res) {
  if(req.isAuthenticated()) {
    res.send('Logged');
  } else {
    res.sendFile(__dirname + '/index.html');
  }
});
app.get('/about', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

app.post('/check_username', function(req, res) {
  var username = req.body.username;
  if(ValidateUsername(username)==true){
    const checkIfUsernameExist = function(db, callback) {
      // Get the documents collection
      const collection = db.collection('users');
      // Find some documents
      collection.find({'username': username}).toArray(function(err, data) {
        assert.equal(err, null);
        if (data[0]){
          res.send('Username already exist');
        } else {
          res.send('Available');
        }
      });
    }
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
      assert.equal(null, err);
      //Connected successfully to MongoDB server
      const db = client.db(dbName);
      checkIfUsernameExist(db, function() {
        client.close();
      });
    });
  } else {
    res.send("Invalid username, allowed: a-z, A-Z, 0-9, underscore and dash");
  }
});

app.post('/check_email', function(req, res) {
  var email = req.body.email;
  if(ValidateEmail(email)==true){
    const checkIfEmailExist = function(db, callback) {
      // Get the documents collection
      const collection = db.collection('users');
      // Find some documents
      collection.find({'email': email}).toArray(function(err, data) {
        assert.equal(err, null);
        if (data[0]){
          res.send('Email already registered');
        } else {
          res.send('Available');
        }
      });
    }
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
      assert.equal(null, err);
      //Connected successfully to MongoDB server
      const db = client.db(dbName);
      checkIfEmailExist(db, function() {
        client.close();
      });
    });
  } else {
    res.send("Invalid email address");
  }
});

app.post('/activate', function(req, res) {
  var activation_code = req.body.activation_code;
  if(ValidateActivationCode(activation_code)==true){
    const checkIfEmailExist = function(db, callback) {
      // Get the documents collection
      const collection = db.collection('users');
      // Find some documents
      collection.find({'activation_code': activation_code}).toArray(function(err, data) {
        assert.equal(err, null);
        if (data[0]){
          collection.updateOne({ activation_code : activation_code }
            , { $set: { activated : "true" } }, function(err, result) {
              assert.equal(err, null);
              assert.equal(1, result.result.n);
              console.log("Updated the document with the field a equal to 2");
              res.send('Activated');
            });
        } else {
          res.send('Invalid code');
        }
      });
    }
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
      assert.equal(null, err);
      //Connected successfully to MongoDB server
      const db = client.db(dbName);
      checkIfEmailExist(db, function() {
        client.close();
      });
    });
  } else {
    res.send("Invalid code format");
  }
});

app.post('/register', function (req, res) {
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
      const insertCreatedAccount = function(db, callback) {
        const collection = db.collection('users');
        bcrypt.hash(password, saltRounds, function(err, hash) {
          collection.find({'username': username}).toArray(function(err, data) {
            assert.equal(err, null);
            if(!data[0]){
              collection.find({'email': email}).toArray(function(err, data) {
                assert.equal(err, null);
                if(!data[0]){
                  const activation_code=keygen.url(keygen.small);
                  collection.insertOne({ username: username, email: email, password: hash, activated: "false", activation_code: activation_code }, function(err, result) {
                    assert.equal(err, null);
                    res.send("Registered");
                    sendmail({
                      from: noreply,
                      to: email,
                      subject: 'Please confirm your email address - Stellite Funding Platform',
                      html: '<h2>Stellite Funding Platform</h2><p>Please go to <a href="http://'+hostname+'/activate">http://'+hostname+'/activate</a>, and enter the following code:<br><p><strong>'+activation_code+'</strong></p></p><h6 style="font-weight:normal;">This code is only available for 2 hours, after that you will need to register again.</h6>',
                    }, function(err, reply) {
                      console.log(err && err.stack);
                      console.dir(reply);
                    });
                  });
                } else {
                  res.send('Email already registered');
                }
              });
            } else {
              res.send('Username already exist');
            }
          });
        });
      }
      MongoClient.connect(url,  { useNewUrlParser: true }, function(err, client) {
        assert.equal(null, err);
        const db = client.db(dbName);
        insertCreatedAccount(db, function() {
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
  if(ValidateEmail(req.body.email)==true){
    passport.authenticate('local', function(err, user, info) {
      if (err) { return next(err); }
      if (!user) { return res.send(info); }
      req.logIn(user, function(err) {
        if (err) { return next(err); }
        return res.send('Logged');
      });
    })(req, res, next);
  } else {
    res.send("Invalid email address");
  }
});

app.get('/logout', function (req, res){
  req.session.destroy(function (err) {
    res.redirect('/login');
  });
});

app.use(express.static('public'));
app.listen(3000);
