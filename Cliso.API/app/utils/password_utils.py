import hashlib;
import hmac;
import secrets;
from typing import ClassVar;

from app.domain.models import PasswordRequirement;


class PasswordUtils:
	"""Utilidades para las contraseñas: hashearlas, comprobarlas y verificar que cumplen los requisitos mínimos.

	Clase estática: no se instancia. El hash se guarda como texto con todo lo necesario para comprobarlo más tarde:
	`scrypt$<n>$<r>$<p>$<sal en hexadecimal>$<hash en hexadecimal>`.
	"""

	# region PRIVATE CONSTANTS

	_MIN_LENGTH: ClassVar[int] = 8;
	"""Longitud mínima de una contraseña."""

	_ALGORITHM: ClassVar[str] = "scrypt";
	"""Nombre del algoritmo de hash, escrito al principio del hash guardado."""

	_COST: ClassVar[int] = 16384;
	"""Coste de CPU y memoria de scrypt (`n`): cuanto mayor, más lento es calcular (y atacar) un hash."""

	_BLOCK_SIZE: ClassVar[int] = 8;
	"""Tamaño de bloque de scrypt (`r`)."""

	_PARALLELISM: ClassVar[int] = 1;
	"""Paralelismo de scrypt (`p`)."""

	_SALT_LENGTH: ClassVar[int] = 16;
	"""Longitud en bytes de la sal aleatoria de cada contraseña."""

	_HASH_LENGTH: ClassVar[int] = 32;
	"""Longitud en bytes del hash calculado."""

	# endregion PRIVATE CONSTANTS

	# region PUBLIC STATIC METHODS

	@staticmethod
	def hash(password: str) -> str:
		"""Calcula el hash de una contraseña con una sal aleatoria nueva.

		Args:
			password: Contraseña en texto plano.

		Returns:
			El hash, con el algoritmo, sus parámetros y la sal, listo para guardar.
		"""
		salt = secrets.token_bytes(PasswordUtils._SALT_LENGTH);
		computed = PasswordUtils._compute(
			password, salt, PasswordUtils._COST, PasswordUtils._BLOCK_SIZE, PasswordUtils._PARALLELISM
		);
		return (
			f"{PasswordUtils._ALGORITHM}${PasswordUtils._COST}${PasswordUtils._BLOCK_SIZE}${PasswordUtils._PARALLELISM}"
			f"${salt.hex()}${computed.hex()}"
		);

	@staticmethod
	def verify(password: str, stored_hash: str) -> bool:
		"""Comprueba si una contraseña corresponde a un hash guardado.

		Args:
			password: Contraseña en texto plano.
			stored_hash: Hash guardado, tal como lo devolvió `hash`.

		Returns:
			True si la contraseña es la que dio ese hash. False si no lo es o si el hash guardado no tiene un formato válido.
		"""
		is_valid = False;
		parts = stored_hash.split("$");
		if len(parts) == 6 and parts[0] == PasswordUtils._ALGORITHM:
			try:
				cost = int(parts[1]);
				block_size = int(parts[2]);
				parallelism = int(parts[3]);
				salt = bytes.fromhex(parts[4]);
				expected = bytes.fromhex(parts[5]);
				computed = PasswordUtils._compute(password, salt, cost, block_size, parallelism);
				# Se compara en tiempo constante para no dar pistas de cuántos bytes coinciden.
				is_valid = hmac.compare_digest(computed, expected);
			except ValueError:
				# Parámetros o hexadecimal corruptos: el hash no es válido y la contraseña no coincide.
				is_valid = False;
		else:
			# No tiene las seis partes esperadas o es de otro algoritmo: no se puede comprobar.
			is_valid = False;
		return is_valid;

	@staticmethod
	def check_requirements(password: str) -> list[PasswordRequirement]:
		"""Comprueba los requisitos mínimos de una contraseña: longitud, mayúscula, minúscula, número y símbolo.

		Args:
			password: Contraseña en texto plano.

		Returns:
			Los requisitos que no cumple. La lista queda vacía si los cumple todos.
		"""
		has_upper = False;
		has_lower = False;
		has_digit = False;
		has_symbol = False;
		for character in password:
			if character.isupper():
				has_upper = True;
			elif character.islower():
				has_lower = True;
			elif character.isdigit():
				has_digit = True;
			elif not character.isalnum():
				has_symbol = True;
			else:
				# Otra letra o cifra que no es mayúscula, minúscula ni dígito decimal: no cuenta para ningún requisito.
				pass;

		errors: list[PasswordRequirement] = [];
		if len(password) < PasswordUtils._MIN_LENGTH:
			errors.append(PasswordRequirement.MIN_LENGTH);
		if not has_upper:
			errors.append(PasswordRequirement.UPPERCASE);
		if not has_lower:
			errors.append(PasswordRequirement.LOWERCASE);
		if not has_digit:
			errors.append(PasswordRequirement.DIGIT);
		if not has_symbol:
			errors.append(PasswordRequirement.SYMBOL);
		return errors;

	# endregion PUBLIC STATIC METHODS

	# region PRIVATE STATIC METHODS

	@staticmethod
	def _compute(password: str, salt: bytes, cost: int, block_size: int, parallelism: int) -> bytes:
		"""Calcula el hash scrypt de una contraseña con una sal y unos parámetros dados.

		Args:
			password: Contraseña en texto plano.
			salt: Sal con la que se calcula.
			cost: Coste de CPU y memoria (`n`).
			block_size: Tamaño de bloque (`r`).
			parallelism: Paralelismo (`p`).

		Returns:
			El hash calculado.

		Raises:
			ValueError: Si los parámetros no son válidos para scrypt.
		"""
		return hashlib.scrypt(
			password.encode("utf-8"), salt=salt, n=cost, r=block_size, p=parallelism, dklen=PasswordUtils._HASH_LENGTH
		);

	# endregion PRIVATE STATIC METHODS
