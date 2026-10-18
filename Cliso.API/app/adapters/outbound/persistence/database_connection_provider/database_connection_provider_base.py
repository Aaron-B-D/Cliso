from abc import ABC, abstractmethod;

from app.adapters.outbound.persistence import DatabaseConnectionBase;


class DatabaseConnectionProviderBase(ABC):
	"""Contrato de quien entrega conexiones a la base de datos. Es lo único que necesita quien solo consulta datos."""

	# region PUBLIC METHODS

	@abstractmethod
	def connect(self) -> DatabaseConnectionBase:
		"""Entrega una conexión a la base de datos.

		Returns:
			La conexión abierta. Quien la pide es responsable de cerrarla.

		Raises:
			DatabaseNotFoundError: Si la base de datos no existe.
			DatabaseOperationError: Si no se puede conectar.
		"""

	# endregion PUBLIC METHODS
