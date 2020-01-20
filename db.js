const spicedPg = require('spiced-pg'),
    db = spicedPg('postgres:postgres:postgres@localhost:5432/bitter');

exports.getImages = () => {
    return db.query(`SELECT * FROM images`).then(({ rows }) => rows);
};
