from app.application.exceptions.user.user_error import UserError;
from app.domain.models import PasswordRequirement;


class UserPasswordValidationError(UserError):
	"""La contraseña de un usuario no cumple los requisitos mínimos (longitud, mayúscula, minúscula, número, símbolo)."""

	# region CONSTRUCTOR

	def __init__(self, requirements: list[PasswordRequirement]) -> None:
		"""Crea la excepción con los requisitos incumplidos.

		Args:
			requirements: Los requisitos que la contraseña no cumple (no puede estar vacía).
		"""
		super().__init__(f"La contraseña no cumple los requisitos: {', '.join(requirements)}");

		self.requirements = requirements;
		"""Los requisitos que la contraseña no cumple."""

	# endregion CONSTRUCTOR
