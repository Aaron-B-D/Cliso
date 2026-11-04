from typing import ClassVar;

from app.application.exceptions import ApplicationParameterValidationError;
from app.application.ports.inbound import ApplicationParameterServiceBase, PermissionServiceBase;
from app.application.ports.outbound import ApplicationParameterRepositoryBase;
from app.domain.models import ApplicationParameter, ApplicationParameterType, Permission, Session;
from app.utils import ApplicationParameterUtils;


class ApplicationParameterService(ApplicationParameterServiceBase):
	"""Caso de uso de los parámetros de la aplicación: sirve los guardados en base de datos y modifica su valor.

	Consultarlos no exige permiso (los lee el arranque, sin sesión); modificarlos exige el permiso
	`APPLICATION_PARAMETERS_EDIT`.
	"""

	# region PRIVATE CONSTANTS

	_MAX_VALUE_LENGTH: ClassVar[int] = 500;
	"""Longitud máxima, en caracteres, del valor de cualquier parámetro."""

	_MAX_SESSION_TIMEOUT_MILLISECONDS: ClassVar[int] = 31_536_000_000;
	"""Tiempo máximo de caducidad de la sesión: 1 año (365 días), en milisegundos."""

	# endregion PRIVATE CONSTANTS

	# region CONSTRUCTOR

	def __init__(self, repository: ApplicationParameterRepositoryBase, permission_service: PermissionServiceBase) -> None:
		"""Crea el servicio.

		Args:
			repository: Repositorio donde están guardados los parámetros.
			permission_service: Servicio de permisos, para comprobar que el usuario de la sesión puede modificarlos.
		"""
		self._repository = repository;
		"""Repositorio donde están guardados los parámetros."""

		self._permission_service = permission_service;
		"""Servicio de permisos, para comprobar que el usuario de la sesión puede modificarlos."""

	# endregion CONSTRUCTOR

	# region PUBLIC METHODS

	def get_parameters(self) -> list[ApplicationParameter]:
		"""Devuelve todos los parámetros de la aplicación.

		Returns:
			Los parámetros, con su valor actual.

		Raises:
			PersistenceError: Si falla el acceso al almacenamiento.
		"""
		return self._repository.get_all();

	def get_parameter(self, parameter_type: ApplicationParameterType) -> ApplicationParameter:
		"""Devuelve un parámetro de la aplicación.

		Args:
			parameter_type: Tipo del parámetro.

		Returns:
			El parámetro pedido.

		Raises:
			ApplicationParameterNotFoundError: Si ese parámetro no existe.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""
		return self._repository.get_by_type(parameter_type);

	def update_parameter(
		self, session: Session, parameter_type: ApplicationParameterType, value: str
	) -> ApplicationParameter:
		"""Modifica el valor actual de un parámetro de la aplicación. Su valor por defecto no cambia.

		Args:
			session: Sesión del usuario que lo modifica.
			parameter_type: Tipo del parámetro.
			value: Valor nuevo, como texto.

		Returns:
			El parámetro modificado.

		Raises:
			PermissionDeniedError: Si el rol del usuario no permite modificar los parámetros.
			ApplicationParameterNotFoundError: Si ese parámetro no existe.
			ApplicationParameterValidationError: Si el valor no es válido para el tipo del parámetro.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""
		self._permission_service.check(session, Permission.APPLICATION_PARAMETERS_EDIT);
		# Las tres operaciones siguientes usan conexiones distintas y no forman una transacción: si otra petición
		# modifica el mismo parámetro entre medias, gana la última. Es aceptable porque solo lo modifican administradores.
		parameter = self._repository.get_by_type(parameter_type);
		ApplicationParameterService._validate_value(parameter_type, value);
		self._repository.update(parameter_type, value);
		parameter.value = value;
		return parameter;

	# endregion PUBLIC METHODS

	# region PRIVATE STATIC METHODS

	@staticmethod
	def _validate_value(parameter_type: ApplicationParameterType, value: str) -> None:
		"""Comprueba que un valor es válido para el tipo de parámetro, con la regla de cada tipo.

		Args:
			parameter_type: Tipo del parámetro.
			value: Valor que se quiere guardar, como texto.

		Raises:
			ApplicationParameterValidationError: Si el valor no tiene la forma que exige el tipo.
			NotImplementedError: Si el tipo no tiene todavía una regla de validación (es un fallo de programación).
		"""
		if len(value) > ApplicationParameterService._MAX_VALUE_LENGTH:
			raise ApplicationParameterValidationError(
				f"El valor no puede tener más de {ApplicationParameterService._MAX_VALUE_LENGTH} caracteres"
			);

		match parameter_type:
			case ApplicationParameterType.LANGUAGE:
				ApplicationParameterService._validate_language(value);
			case ApplicationParameterType.BIM_MODELS_DIRECTORY:
				ApplicationParameterService._validate_bim_models_directory(value);
			case ApplicationParameterType.SESSION_TIMEOUT_MILLISECONDS:
				ApplicationParameterService._validate_session_timeout_milliseconds(value);
			case _:
				raise NotImplementedError(f"El parámetro '{parameter_type}' no tiene regla de validación");

	@staticmethod
	def _validate_language(value: str) -> None:
		"""Comprueba el valor del idioma de la aplicación: un código como es-ES.

		Raises:
			ApplicationParameterValidationError: Si no es un código de idioma.
		"""
		if not ApplicationParameterUtils.is_language_code(value):
			raise ApplicationParameterValidationError(f"El idioma debe ser un código como es-ES: '{value}'");

	@staticmethod
	def _validate_bim_models_directory(value: str) -> None:
		"""Comprueba el valor de la carpeta de los modelos BIM: no puede estar vacío ni empezar o acabar con espacios.

		Raises:
			ApplicationParameterValidationError: Si está vacío, en blanco o tiene espacios al principio o al final.
		"""
		if ApplicationParameterUtils.is_blank(value):
			raise ApplicationParameterValidationError("La carpeta de los modelos BIM no puede estar vacía");

		if ApplicationParameterUtils.has_surrounding_spaces(value):
			raise ApplicationParameterValidationError(
				f"La carpeta de los modelos BIM no puede empezar ni acabar con espacios: '{value}'"
			);

	@staticmethod
	def _validate_session_timeout_milliseconds(value: str) -> None:
		"""Comprueba el valor del tiempo de caducidad de la sesión: un entero mayor que cero y de 1 año como máximo.

		Raises:
			ApplicationParameterValidationError: Si no es un entero mayor que cero o supera el máximo.
		"""
		if not ApplicationParameterUtils.is_positive_integer(value):
			raise ApplicationParameterValidationError(
				f"El tiempo de caducidad de la sesión debe ser un número entero mayor que cero: '{value}'"
			);

		if int(value) > ApplicationParameterService._MAX_SESSION_TIMEOUT_MILLISECONDS:
			raise ApplicationParameterValidationError(
				f"El tiempo de caducidad de la sesión no puede superar {ApplicationParameterService._MAX_SESSION_TIMEOUT_MILLISECONDS} milisegundos (1 año): '{value}'"
			);

	# endregion PRIVATE STATIC METHODS
