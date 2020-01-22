DROP TABLE IF EXISTS comments;

CREATE TABLE comments
(
    comment TEXT NOT NULL,
    username VARCHAR(255) NOT NULL,
    imageId INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


