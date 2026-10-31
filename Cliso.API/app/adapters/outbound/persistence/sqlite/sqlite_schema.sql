-- Esquema de la base de datos (SQLite). Se ejecuta al crear la base de datos (que debe estar vacía).


CREATE TABLE application_parameter (
	id            INTEGER PRIMARY KEY AUTOINCREMENT,
	type          TEXT    NOT NULL UNIQUE,
	default_value TEXT    NOT NULL,
	current_value TEXT    NOT NULL
);

CREATE TABLE user (
	id            INTEGER PRIMARY KEY AUTOINCREMENT,
	nick          TEXT    NOT NULL UNIQUE,
	name          TEXT    NOT NULL,
	surname       TEXT    NOT NULL,
	password      TEXT    NOT NULL,
	active        INTEGER NOT NULL DEFAULT 1,
	creation_date TEXT    NOT NULL
);

CREATE TABLE bim_model (
	id            INTEGER PRIMARY KEY AUTOINCREMENT,
	name          TEXT    NOT NULL,
	description   TEXT    NOT NULL DEFAULT '',
	file_name     TEXT    NOT NULL,
	active        INTEGER NOT NULL DEFAULT 1,
	creation_date TEXT    NOT NULL
);

CREATE TABLE visualization (
	id            INTEGER PRIMARY KEY AUTOINCREMENT,
	owner_id      INTEGER NOT NULL REFERENCES user(id),
	model_id      INTEGER NOT NULL REFERENCES bim_model(id),
	name          TEXT    NOT NULL,
	description   TEXT    NOT NULL DEFAULT '',
	observations  TEXT    NOT NULL DEFAULT '',
	is_public     INTEGER NOT NULL DEFAULT 0,
	active        INTEGER NOT NULL DEFAULT 1
);
