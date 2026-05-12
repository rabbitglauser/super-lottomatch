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


CREATE TABLE IF NOT EXISTS guests (
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    guest_code VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    address_id INTEGER NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    allow_email_marketing BOOLEAN NOT NULL,
    allow_post_marketing BOOLEAN NOT NULL,
    notes TEXT,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT INTO guests (guest_code, first_name, last_name, address_id, phone, email, allow_email_marketing, allow_post_marketing, notes)
    VALUES 
        ('GUEST123', 'John', 'Doe', 1, '123-456-7890', 'john.doe@example.com', TRUE, TRUE, 'Sample notes'),
        ('GUEST456', 'Jane', 'Smith', 2, '987-654-3210', 'jane.smith@example.com', TRUE, TRUE, 'Sample notes'),
        ('GUEST789', 'Alice', 'Johnson', 3, '555-123-4567', 'alice.johnson@example.com', TRUE, TRUE, 'Sample notes'),
        ('GUEST321', 'Bob', 'Brown', 4, '444-987-6543', 'bob.brown@example.com', TRUE, TRUE, 'Sample notes');


