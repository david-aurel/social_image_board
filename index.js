const express = require('express'),
    app = express(); // create express

// require other files
const db = require('./db');

app.use(express.static('./public')); //set path for files
app.use(express.json()); //use json for the axios requests

app.get('/images', (req, res) => {
    db.getImages().then(data => {
        res.json(data);
    });
});

app.listen(8080);
