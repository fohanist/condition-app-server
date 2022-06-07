CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    user_name VARCHAR(30) NOT NULL,
    user_email VARCHAR(100) UNIQUE NOT NULL,
    user_password TEXT NOT NULL,
	user_salt TEXT NOT NULL,
    user_code VARCHAR(50) UNIQUE NOT NULL,
    condition VARCHAR(30) NOT NULL,
    avatar_url TEXT,
    create_date TIMESTAMP NOT NULL,
    update_date TIMESTAMP NOT NULL
);

CREATE TABLE friends (
    id SERIAL PRIMARY KEY,
    user_from INTEGER NOT NULL,
    user_to INTEGER NOT NULL,
    create_date TIMESTAMP NOT NULL
);

CREATE TABLE condition_log (
    id SERIAL PRIMARY KEY,
    user_from INTEGER NOT NULL,
    condition VARCHAR(30) NOT NULL,
    create_date TIMESTAMP NOT NULL
);