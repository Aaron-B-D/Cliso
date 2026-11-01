-- Esquema de la base de datos (MySQL). Se ejecuta al crear la base de datos (que debe estar vacía).

CREATE TABLE application_parameter (
	id            BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
	type          VARCHAR(100) NOT NULL UNIQUE,
	default_value TEXT         NOT NULL,
	current_value TEXT         NOT NULL
);

CREATE TABLE user (
	id            BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
	nick          VARCHAR(50)  NOT NULL UNIQUE,
	name          VARCHAR(100) NOT NULL,
	surname       VARCHAR(150) NOT NULL,
	password      VARCHAR(255) NOT NULL,
	role          VARCHAR(20)  NOT NULL,
	active        BOOLEAN      NOT NULL DEFAULT TRUE,
	creation_date DATETIME     NOT NULL,
	update_date   DATETIME     NULL
);

CREATE TABLE bim_model (
	id               BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
	name             VARCHAR(200) NOT NULL,
	description      TEXT         NOT NULL,
	observations     TEXT         NOT NULL,
	file_name        VARCHAR(255) NOT NULL,
	stored_file_name VARCHAR(255) NOT NULL UNIQUE,
	active           BOOLEAN      NOT NULL DEFAULT TRUE,
	creation_date    DATETIME     NOT NULL,
	update_date      DATETIME     NULL
);

CREATE TABLE visualization (
	id            BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
	user_id       BIGINT       NOT NULL,
	bim_model_id  BIGINT       NOT NULL,
	name          VARCHAR(200) NOT NULL,
	description   TEXT         NOT NULL,
	observations  TEXT         NOT NULL,
	is_public     BOOLEAN      NOT NULL DEFAULT FALSE,
	active        BOOLEAN      NOT NULL DEFAULT TRUE,
	creation_date DATETIME     NOT NULL,
	update_date   DATETIME     NULL,
	FOREIGN KEY (user_id) REFERENCES user(id),
	FOREIGN KEY (bim_model_id) REFERENCES bim_model(id)
);

CREATE TABLE visualization_piece (
	id               BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	visualization_id BIGINT NOT NULL,
	content          JSON   NOT NULL,
	FOREIGN KEY (visualization_id) REFERENCES visualization(id) ON DELETE CASCADE
);
