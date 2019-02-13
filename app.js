
var express = require('express');
var app = express();

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/js/materialize.min.js', function(req, res) {
    res.sendFile(__dirname + '/js/materialize.min.js');
});

app.get('/css/materialize.min.css', function(req, res) {
    res.sendFile(__dirname + '/css/materialize.min.css');
});

app.get('/css/stellite-funding.css', function(req, res) {
    res.sendFile(__dirname + '/css/stellite-funding.css');
});

app.get('/js/jquery-3.3.1.min.js', function(req, res) {
    res.sendFile(__dirname + '/js/jquery-3.3.1.min.js');
});

app.get('/js/jquery-stellite-funding.js', function(req, res) {
    res.sendFile(__dirname + '/js/jquery-stellite-funding.js');
});

app.get('/about', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.use(express.static('public'));

app.listen(3000);
