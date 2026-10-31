from collections.abc import AsyncIterator;
from pathlib import Path;
from typing import ClassVar;

from app.application.exceptions import BIMModelContentNotFoundError, BIMModelValidationError;
from app.application.ports.inbound import BIMModelServiceBase;
from app.application.ports.outbound import BIMModelFileStorageBase, BIMModelRepositoryBase;
from app.domain.models import BIMModel;
from app.domain.wrappers import BIMModelWrapper;


class BIMModelService(BIMModelServiceBase):
	"""Caso de uso de los modelos BIM: gestionar sus datos básicos y su fichero IFC."""

	# region PRIVATE CONSTANTS

	_NAME_MAX_LENGTH: ClassVar[int] = 200;
	"""Longitud máxima del nombre de un modelo (la de la columna `name`)."""

	_FILE_NAME_MAX_LENGTH: ClassVar[int] = 255;
	"""Longitud máxima del nombre de un fichero (la de la columna `file_name`)."""

	_FILE_EXTENSION: ClassVar[str] = ".ifc";
	"""Extensión que deben tener los ficheros de los modelos."""

	# endregion PRIVATE CONSTANTS

	# region CONSTRUCTOR

	def __init__(self, repository: BIMModelRepositoryBase, file_storage: BIMModelFileStorageBase) -> None:
		"""Crea el servicio.

		Args:
			repository: Acceso a los datos de los modelos guardados.
			file_storage: Almacenamiento de los ficheros IFC.
		"""
		self._repository = repository;
		"""Acceso a los datos de los modelos guardados."""

		self._file_storage = file_storage;
		"""Almacenamiento de los ficheros IFC."""

	# endregion CONSTRUCTOR

	# region PUBLIC METHODS

	def get_bim_models(self) -> list[BIMModelWrapper]:
		"""Recupera todos los modelos BIM activos, con el tamaño de su fichero.

		Returns:
			Los modelos activos (la lista queda vacía si no hay ninguno).

		Raises:
			FileStorageError: Si no se puede consultar el tamaño de algún fichero.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""
		return [self._wrap(model) for model in self._repository.get_all()];

	def get_bim_model(self, model_id: int) -> BIMModelWrapper:
		"""Recupera el modelo BIM activo con ese identificador, con el tamaño de su fichero.

		Args:
			model_id: Identificador del modelo.

		Returns:
			El modelo encontrado.

		Raises:
			BIMModelNotFoundError: Si no hay ningún modelo activo con ese identificador.
			FileStorageError: Si no se puede consultar el tamaño del fichero.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""
		return self._wrap(self._repository.get_by_id(model_id));

	def add_bim_model(self, model: BIMModel) -> BIMModelWrapper:
		"""Añade un modelo BIM con sus datos básicos. El fichero se sube después, con `set_content`.

		Args:
			model: Modelo a añadir (sin `id`).

		Returns:
			El modelo guardado, con el `id` que le ha asignado el sistema y sin fichero (tamaño 0).

		Raises:
			BIMModelValidationError: Si el nombre está vacío o es demasiado largo.
			FileStorageError: Si no se puede consultar el tamaño del fichero.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""
		model.name = self._validate_name(model.name);
		return self._wrap(self._repository.add(model));

	def update_bim_model(self, model_id: int, model: BIMModel) -> BIMModelWrapper:
		"""Modifica los datos básicos (nombre y descripción) de un modelo BIM. No toca su fichero.

		Args:
			model_id: Identificador del modelo a modificar.
			model: Modelo con los datos nuevos. Solo se usan su nombre y su descripción.

		Returns:
			El modelo ya modificado, con el tamaño de su fichero.

		Raises:
			BIMModelValidationError: Si el nombre está vacío o es demasiado largo.
			BIMModelNotFoundError: Si no hay ningún modelo activo con ese identificador.
			FileStorageError: Si no se puede consultar el tamaño del fichero.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""
		name = self._validate_name(model.name);
		stored = self._repository.get_by_id(model_id);
		stored.name = name;
		stored.description = model.description;
		self._repository.update(stored);
		return self._wrap(stored);

	async def set_content(self, model_id: int, file_name: str, content: AsyncIterator[bytes]) -> BIMModelWrapper:
		"""Guarda el fichero IFC de un modelo BIM, recibido por trozos. Si el modelo ya tenía fichero, lo sustituye.

		Args:
			model_id: Identificador del modelo.
			file_name: Nombre original del fichero (debe acabar en `.ifc`).
			content: Contenido del fichero, por trozos.

		Returns:
			El modelo, con el nombre y el tamaño del fichero ya actualizados.

		Raises:
			BIMModelValidationError: Si el nombre del fichero no es válido.
			BIMModelNotFoundError: Si no hay ningún modelo activo con ese identificador.
			FileStorageError: Si no se puede guardar el fichero.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""
		# 1. Comprobamos el nombre y que el modelo existe antes de recibir ni un byte.
		clean_file_name = self._validate_file_name(file_name);
		stored = self._repository.get_by_id(model_id);

		# 2. Guardamos el fichero y, solo si ha ido bien, anotamos su nombre en el modelo.
		await self._file_storage.save(model_id, content);
		stored.file_name = clean_file_name;
		self._repository.update(stored);
		return self._wrap(stored);

	def get_content_path(self, model_id: int) -> Path:
		"""Devuelve la ruta del fichero IFC de un modelo BIM, para enviarlo por trozos.

		Args:
			model_id: Identificador del modelo.

		Returns:
			La ruta del fichero guardado.

		Raises:
			BIMModelNotFoundError: Si no hay ningún modelo activo con ese identificador.
			BIMModelContentNotFoundError: Si el modelo todavía no tiene fichero.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""
		stored = self._repository.get_by_id(model_id);
		if stored.file_name == "":
			raise BIMModelContentNotFoundError(f"El modelo BIM {model_id} todavía no tiene fichero");
		return self._file_storage.get_path(model_id);

	def delete_bim_model(self, model_id: int, force: bool) -> None:
		"""Elimina un modelo BIM.

		Args:
			model_id: Identificador del modelo.
			force: Si es False, el borrado es lógico (el modelo queda inactivo y se conservan sus datos, sus
				visualizaciones y su fichero). Si es True, se borran de verdad el modelo, sus visualizaciones y su fichero.

		Raises:
			BIMModelNotFoundError: Si no existe el modelo (con `force` False, tiene que estar activo).
			FileStorageError: Si con `force` no se puede borrar el fichero.
			PersistenceError: Si falla el acceso al almacenamiento.
		"""
		if force:
			# Con force, primero la base de datos y luego el fichero: si falla el fichero queda uno huérfano en disco,
			# pero nunca un modelo apuntando a un fichero que ya no existe.
			self._repository.delete(model_id);
			self._file_storage.delete(model_id);
		else:
			self._repository.deactivate(model_id);

	# endregion PUBLIC METHODS

	# region PRIVATE METHODS

	def _wrap(self, model: BIMModel) -> BIMModelWrapper:
		"""Envuelve un modelo con el tamaño de su fichero.

		Args:
			model: Modelo guardado.

		Returns:
			El modelo junto con el tamaño de su fichero (0 si todavía no tiene).

		Raises:
			FileStorageError: Si no se puede consultar el tamaño del fichero.
		"""
		file_size = 0;
		if model.id is not None and model.file_name != "":
			file_size = self._file_storage.get_size(model.id);
		return BIMModelWrapper(
			id=model.id,
			name=model.name,
			description=model.description,
			file_name=model.file_name,
			active=model.active,
			creation_date=model.creation_date,
			file_size=file_size,
		);

	def _validate_name(self, name: str) -> str:
		"""Comprueba el nombre de un modelo.

		Args:
			name: Nombre recibido.

		Returns:
			El nombre sin espacios al principio ni al final.

		Raises:
			BIMModelValidationError: Si el nombre está vacío o supera la longitud máxima.
		"""
		clean_name = name.strip();
		if clean_name == "":
			raise BIMModelValidationError("El nombre del modelo BIM no puede estar vacío");
		if len(clean_name) > self._NAME_MAX_LENGTH:
			raise BIMModelValidationError(f"El nombre del modelo BIM no puede superar los {self._NAME_MAX_LENGTH} caracteres");
		return clean_name;

	def _validate_file_name(self, file_name: str) -> str:
		"""Comprueba el nombre de un fichero IFC.

		Args:
			file_name: Nombre recibido.

		Returns:
			El nombre sin espacios al principio ni al final.

		Raises:
			BIMModelValidationError: Si el nombre está vacío, es demasiado largo, lleva una ruta o no acaba en `.ifc`.
		"""
		clean_file_name = file_name.strip();
		if clean_file_name == "" or len(clean_file_name) > self._FILE_NAME_MAX_LENGTH:
			raise BIMModelValidationError(
				f"El nombre del fichero debe tener entre 1 y {self._FILE_NAME_MAX_LENGTH} caracteres"
			);
		if "/" in clean_file_name or "\\" in clean_file_name:
			raise BIMModelValidationError("El nombre del fichero no puede incluir una ruta");
		if not clean_file_name.lower().endswith(self._FILE_EXTENSION):
			raise BIMModelValidationError(f"El fichero debe tener la extensión {self._FILE_EXTENSION}");
		return clean_file_name;

	# endregion PRIVATE METHODS
