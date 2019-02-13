
var express = require('express');
var app = express();

app.get('/about', function(req, res) {
    res.sendFile(__dirname + '/about.html');
});

app.listen(3000);
