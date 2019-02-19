
var express = require('express');
const uuid = require('uuid/v4');
var app = express();
const session = require('express-session');
const FileStore = require('session-file-store')(session);
var bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

var userid;

const users = [
  {id: '2f24vvg', email: 'test@test.com', password: 'password'}
]

// configure passport.js to use the local strategy
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  (email, password, done) => {
    console.log('Inside local strategy callback')
    // here is where you make a call to the database
    // to find the user based on their username or email address
    // for now, we'll just pretend we found that it was users[0]
    const user = users[0]
    if(email === user.email && password === user.password) {
      console.log('Local strategy returned true')
      return done(null, user)
    }
  }
));

// tell passport how to serialize the user
passport.serializeUser((user, done) => {
  //Inside serializeUser callback. User id is save to the session file store here
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  //Inside deserializeUser callback
  //The user id passport saved in the session file store is: id
  userid=id;
  const user = users[0].id === id ? users[0] : false;
  done(null, user);
});


// add & configure middleware
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(session({
  genid: (req) => {
    console.log('Inside session middleware genid function');
    console.log(`Request object sessionID from client: ${req.sessionID}`);
    return uuid(); // use UUIDs for session IDs
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
      res.redirect('/');
    } else {
      res.sendFile(__dirname + '/index.html');
    }
});
app.get('/about', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});


app.get('/logged', function(req, res) {
  if(req.isAuthenticated()) {
    res.send({ userid: userid });
  } else {
    res.send('false')
  }
});

// app.post('/login', (req, res) => {
//   var email = req.body.email, password = req.body.password;
//   res.send("You posted email: "+ email +" & password: "+ password +" to the login page!\n");
//   console.log(req.sessionID);
// });

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/logged');
  });

  app.get('/logout', function (req, res){
    req.session.destroy(function (err) {
      res.redirect('/'); //Inside a callback… bulletproof!
    });
  });

app.use(express.static('public'));
app.listen(3000);
