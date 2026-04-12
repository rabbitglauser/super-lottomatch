-- the DB is connected to railway, and render is already importing it !!

-- TODO: replace plaintext password with a hashed column before production
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (name, email, password)
VALUES ('Samuel Glauser', 'samuel.glauser@gmail.com', '123')
ON DUPLICATE KEY UPDATE password = VALUES(password);
