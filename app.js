
var express = require('express');
var app = express();

var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});
app.get('/login', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});
app.get('/about', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.post('/login', (req, res) => {
  var email = req.body.email, password = req.body.password;
  res.send("You posted email: "+ email +" & password: "+ password +" to the login page!\n");
});

app.use(express.static('public'));
app.listen(3000);
