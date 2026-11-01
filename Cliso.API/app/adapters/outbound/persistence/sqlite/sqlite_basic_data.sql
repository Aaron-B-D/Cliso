-- Datos básicos que se cargan al crear una base de datos SQLite, real o demo: los parámetros de la aplicación.
-- Cada sentencia termina en punto y coma.

INSERT INTO application_parameter (type, default_value, current_value) VALUES
	('LANGUAGE', 'es-ES', 'es-ES'),
	('BIM_MODELS_DIRECTORY', 'data/models', 'data/models'),
	('SESSION_TIMEOUT_MILLISECONDS', '1800000', '1800000');
