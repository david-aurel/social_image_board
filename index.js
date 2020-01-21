const express = require('express'),
    app = express(); // create express

// require other files
const db = require('./db');
const s3 = require('./s3');
const { s3Url } = require('./config');

/////////// vv boilerplate for multer file upload vv ////////////
const multer = require('multer');
const uidSafe = require('uid-safe');
const path = require('path');
const diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + '/uploads');
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});
const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    }
});
/////////// ^^ boilerplate for multer file upload ^^////////////

app.use(express.static('./public')); //set path for files
app.use(express.json()); //use json for the axios requests

app.get('/images', (req, res) => {
    db.getImages().then(data => {
        res.json(data);
    });
});

app.post('/upload', uploader.single('file'), s3.upload, (req, res) => {
    // insert a new row into the db for the image
    const imageUrl = s3Url + req.file.filename;
    console.log(
        'POST /upload route was hit',
        imageUrl,
        req.body.username,
        req.body.title,
        req.body.description
    );
    db.addImage(
        imageUrl,
        req.body.username,
        req.body.title,
        req.body.description
    ).then(({ rows }) => {
        res.json(rows[0]); // after the query is successful, send a response
    });
});

app.listen(8080);
