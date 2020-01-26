const spicedPg = require('spiced-pg'),
    db = spicedPg('postgres:postgres:postgres@localhost:5432/bitter');

exports.getImages = lastId => {
    if (lastId != 0) {
        return db
            .query(
                `SELECT id, url, title, (SELECT id FROM images ORDER BY id ASC LIMIT 1) AS "lowestId" FROM images WHERE id < $1 ORDER BY id DESC LIMIT 10`,
                [lastId]
            )
            .then(({ rows }) => rows);
    } else {
        return db
            .query(
                `SELECT id, url, title, (SELECT id FROM images ORDER BY id ASC LIMIT 1) AS "lowestId" FROM images ORDER BY id DESC LIMIT 10`
            )
            .then(({ rows }) => rows);
    }
};

exports.getImageById = id => {
    return db
        .query(`SELECT * FROM images WHERE id = $1`, [id])
        .then(({ rows }) => rows);
};

exports.getMoreImages = lastId => {
    db.query(
        `SELECT * FROM images
        WHERE id < $1
        ORDER BY id DESC
        LIMIT 10`,
        [lastId]
    ).then(({ rows }) => rows);
};

exports.addImage = (url, username, title, description) => {
    return db.query(
        `INSERT INTO images (url, username, title, description) VALUES ($1, $2, $3, $4) RETURNING *`,
        [url, username, title, description]
    );
};

exports.addComment = (comment, username, imageId) => {
    return db.query(
        `INSERT INTO comments (comment, username, imageId) VALUES ($1, $2, $3) RETURNING comment, username`,
        [comment, username, imageId]
    );
};

exports.getComments = imageId => {
    return db
        .query(`SELECT * FROM comments WHERE imageId = $1`, [imageId])
        .then(({ rows }) => rows);
};

exports.deleteImage = id => {
    return db.query(`DELETE FROM images WHERE id = $1`, [id]);
};
