-- Esquema de la base de datos (MySQL). Se ejecuta al crear la base de datos (que debe estar vacía).

CREATE TABLE user (
	id            BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
	nick          VARCHAR(50)  NOT NULL UNIQUE,
	name          VARCHAR(100) NOT NULL,
	surname       VARCHAR(150) NOT NULL,
	password      VARCHAR(255) NOT NULL,
	active        BOOLEAN      NOT NULL DEFAULT TRUE,
	creation_date DATETIME     NOT NULL
);

CREATE TABLE bim_model (
	id            BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
	name          VARCHAR(200) NOT NULL,
	description   TEXT         NOT NULL,
	file_name     VARCHAR(255) NOT NULL,
	active        BOOLEAN      NOT NULL DEFAULT TRUE,
	creation_date DATETIME     NOT NULL
);

CREATE TABLE visualization (
	id            BIGINT       NOT NULL AUTO_INCREMENT PRIMARY KEY,
	owner_id      BIGINT       NOT NULL,
	model_id      BIGINT       NOT NULL,
	name          VARCHAR(200) NOT NULL,
	description   TEXT         NOT NULL,
	observations  TEXT         NOT NULL,
	is_public     BOOLEAN      NOT NULL DEFAULT FALSE,
	active        BOOLEAN      NOT NULL DEFAULT TRUE,
	FOREIGN KEY (owner_id) REFERENCES user(id),
	FOREIGN KEY (model_id) REFERENCES bim_model(id)
);
