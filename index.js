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

app.get('/images/:id', (req, res) => {
    db.getImages(req.params.id)
        .then(results => {
            res.json(results);
        })
        .catch(err => {
            console.log('err in GET /images/:id', err);
            res.sendStatus(500);
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

app.get('/imageById/:id', (req, res) => {
    // console.log('GET /imageById/:id was hit');
    db.getImageById(req.params.id)
        .then(results => {
            res.json(results[0]);
        })
        .catch(err => {
            console.log('err in GET /imageById/:id:', err);
            res.sendStatus(500);
        });
});

app.get('/comments/:imageId', (req, res) => {
    // console.log('GET /comments route was hit');
    db.getComments(req.params.imageId)
        .then(results => {
            res.json(results);
        })
        .catch(err => {
            console.log('err in GET /comments:', err);
            res.sendStatus(500);
        });
});

app.post('/comment/:comment/:username/:imageId', (req, res) => {
    // console.log('POST /comment/: route was hit');
    db.addComment(req.params.comment, req.params.username, req.params.imageId)
        .then(({ rows }) => {
            res.json(rows[0]);
        })
        .catch(err => {
            console.log('err in POST /comment/:', err);
            res.sendStatus(500);
        });
});

app.listen(8080);
