from app.config.settings import Settings;
from app.domain.models import ApplicationSetting, ApplicationSettingParameter;


class SettingsMapper:
	"""Convierte, campo a campo, la configuración `Settings` en los parámetros públicos `ApplicationSetting`.

	Clase estática: no se instancia. Solo copia los parámetros públicos; el resto (como la contraseña de MySQL) no
	se copia nunca. Para hacer público un parámetro nuevo, se añade a `ApplicationSettingParameter` y aquí.
	"""

	# region PUBLIC STATIC METHODS

	@staticmethod
	def to_application_settings(settings: Settings) -> list[ApplicationSetting]:
		"""Convierte la configuración de la aplicación en la lista de sus parámetros públicos.

		Args:
			settings: Configuración de la aplicación.

		Returns:
			Los parámetros públicos de la configuración.
		"""
		return [
			ApplicationSetting(
				parameter=ApplicationSettingParameter.LANGUAGE,
				name="language",
				description="Idioma de arranque de la aplicación, como código internacional (por ejemplo, es-ES).",
				observations="Se cambia en el fichero de settings y requiere reiniciar la API.",
				value=settings.language,
			),
			ApplicationSetting(
				parameter=ApplicationSettingParameter.IS_DEMO,
				name="is_demo",
				description="Indica si la aplicación ha arrancado en modo demo, con una base de datos de demostración.",
				observations="Se cambia en el fichero de settings y requiere reiniciar la API.",
				value=settings.is_demo,
			),
		];

	# endregion PUBLIC STATIC METHODS
