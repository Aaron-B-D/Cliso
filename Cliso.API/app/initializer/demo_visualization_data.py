from typing import ClassVar;

from app.application.use_cases import UserService;
from app.domain.models import BIMModelVisualizationMarkerPiece, Visualization;
from app.initializer.demo_data import DemoData;


class DemoVisualizationData:
	"""Visualizaciones de demostración, escritas como objetos de dominio.

	Clase estática: no se instancia. Los marcadores anclados llevan el identificador local de un elemento real de su modelo
	(el número de la entidad en el fichero IFC) y la coordenada de su centro, medida en el visor; por eso los datos solo
	valen para los ficheros IFC de los modelos demo tal y como están.
	"""

	# region PRIVATE CONSTANTS

	_BIM_LINK: ClassVar[str] = "https://es.wikipedia.org/wiki/Building_information_modeling";
	"""Enlace de ejemplo para los marcadores que llevan uno."""

	_IFC_LINK: ClassVar[str] = "https://www.buildingsmart.org/standards/bsi-standards/industry-foundation-classes/";
	"""Segundo enlace de ejemplo."""

	# endregion PRIVATE CONSTANTS

	# region PUBLIC STATIC METHODS

	@staticmethod
	def get_visualizations(user_ids: dict[str, int], model_ids: dict[str, int]) -> list[Visualization]:
		"""Devuelve las visualizaciones de demostración de todos los modelos BIM, sin guardar (sin `id`).

		Hay trece, repartidas entre el administrador y los dos operadores (cada modelo tiene al menos tres): unas públicas y
		otras privadas, con marcadores libres y anclados y con las distintas opciones de aspecto y comportamiento.

		Args:
			user_ids: Identificador de cada usuario ya guardado, por su nick.
			model_ids: Identificador de cada modelo demo ya guardado, por el nombre de su fichero.

		Returns:
			Las visualizaciones demo.
		"""
		admin = user_ids[UserService.PROTECTED_NICK];
		operator = user_ids[DemoData.OPERATOR_NICK];
		operator2 = user_ids[DemoData.OPERATOR2_NICK];

		result: list[Visualization] = [];
		result.extend(DemoVisualizationData._get_house(admin, operator, model_ids[DemoData.HOUSE_FILE]));
		result.extend(DemoVisualizationData._get_duplex(admin, operator, operator2, model_ids[DemoData.DUPLEX_FILE]));
		result.extend(DemoVisualizationData._get_hub(admin, operator, operator2, model_ids[DemoData.HUB_FILE]));
		result.extend(DemoVisualizationData._get_wellness(admin, operator, operator2, model_ids[DemoData.WELLNESS_FILE]));
		return result;

	# endregion PUBLIC STATIC METHODS

	# region PRIVATE STATIC METHODS

	@staticmethod
	def _get_house(admin: int, operator: int, model: int) -> list[Visualization]:
		"""Devuelve las visualizaciones de la casa de muestra: una vacía, un recorrido con marcadores agrupados y puntos de interés.

		Args:
			admin: Identificador del administrador.
			operator: Identificador del primer operador.
			model: Identificador del modelo de la casa de muestra.

		Returns:
			Las visualizaciones de la casa.
		"""
		piece = BIMModelVisualizationMarkerPiece;
		return [
			Visualization(
				user_id=admin, bim_model_id=model, name="Revisión de plantas",
				description="Privada y vacía: sirve para probar a añadir piezas desde cero.",
			),
			Visualization(
				user_id=admin, bim_model_id=model, name="Recorrido público", is_public=True,
				description="Entrada con tres accesos muy juntos, que se agrupan al alejar la cámara.",
				pieces=[
					piece(
						x=0.08, y=0.01, z=-0.05, anchor_id=10993, color="#FF0000", icon="WARNING", title="Entrada",
						description="Puerta exterior doble. Aquí empieza el recorrido.",
						link=DemoVisualizationData._BIM_LINK, link_target="CURRENT_TAB", dim_when_idle=True, title_position="ABOVE",
					),
					piece(x=0.3, y=0.4, z=-1.0, color="#FFA500", icon="FLAG", title="Acceso norte"),
					piece(x=0.5, y=0.4, z=-1.3, color="#FFA500", icon="FLAG", title="Acceso sur"),
					piece(x=0.2, y=0.4, z=-0.7, color="#FFA500", icon="FLAG", title="Acceso este"),
				],
			),
			Visualization(
				user_id=operator, bim_model_id=model, name="Puntos de interés", is_public=True,
				description="Tamaños, opacidades y colores de título distintos.",
				pieces=[
					piece(
						x=-6.89, y=0.21, z=-2.8, anchor_id=177, color="#00FF00", icon="INFO", size=1.5, title="Salón",
						description="Zona destacada para la visita.", link=DemoVisualizationData._IFC_LINK,
						opacity=0.8, text_color="#00FF00", title_position="RIGHT", visible_through_model=False,
					),
					piece(
						x=0.08, y=0.21, z=-3.9, anchor_id=323, color="#3B82F6", icon="CHECK", title="Dormitorio",
						description="Revisado y conforme.", highlight_on_select=True,
					),
					piece(
						x=-4.82, y=1.57, z=-2.92, anchor_id=35959, color="#A855F7", icon="PIN", size=0.8, title="Cubierta",
						description="Cubierta plana con aislamiento.", title_position="ABOVE",
					),
				],
			),
		];

	@staticmethod
	def _get_duplex(admin: int, operator: int, operator2: int, model: int) -> list[Visualization]:
		"""Devuelve las visualizaciones del dúplex: revisión de acabados, memoria de calidades y notas de obra.

		Args:
			admin: Identificador del administrador.
			operator: Identificador del primer operador.
			operator2: Identificador del segundo operador.
			model: Identificador del modelo del dúplex.

		Returns:
			Las visualizaciones del dúplex.
		"""
		piece = BIMModelVisualizationMarkerPiece;
		return [
			Visualization(
				user_id=operator, bim_model_id=model, name="Revisión de acabados",
				description="Privada. Al pulsar un marcador se resalta su elemento.",
				pieces=[
					piece(
						x=4.78, y=-1.95, z=1.09, anchor_id=514, color="#22C55E", icon="CHECK", title="A101",
						description="Salón de la vivienda A: conforme.", highlight_on_select=True,
					),
					piece(
						x=4.89, y=1.3, z=-2.73, anchor_id=819, color="#F59E0B", icon="WARNING", title="A201",
						description="Mancha de humedad en el techo.", highlight_on_select=True,
					),
					piece(
						x=-1.01, y=-1.95, z=-6.56, anchor_id=2108, color="#22C55E", icon="CHECK", title="B101",
						description="Salón de la vivienda B: conforme.", highlight_on_select=True,
					),
					piece(
						x=0.75, y=1.14, z=-3.22, anchor_id=2637, color="#EF4444", icon="WARNING", title="B204",
						description="Falta el rodapié del dormitorio.", highlight_on_select=True,
					),
				],
			),
			Visualization(
				user_id=admin, bim_model_id=model, name="Memoria de calidades", is_public=True,
				description="Calidades de la vivienda A, con enlaces que se abren en una ventana nueva.",
				pieces=[
					piece(
						x=4.78, y=-1.95, z=1.09, anchor_id=514, color="#3B82F6", icon="INFO", title="Salón",
						description=(
							"Suelo de tarima flotante sobre forjado de viguetas de madera. Paredes en pintura plástica lisa y rodapié "
							"de madera. Ventanas de doble acristalamiento con carpintería de aluminio."
						),
						link=DemoVisualizationData._IFC_LINK, link_target="NEW_WINDOW",
					),
					piece(
						x=0.79, y=-1.95, z=3.36, anchor_id=67, color="#3B82F6", icon="INFO", title="Cocina",
						description="Encimera y frente de gran formato.",
						link=DemoVisualizationData._BIM_LINK, link_target="NEW_WINDOW",
					),
					piece(
						x=4.89, y=1.3, z=-2.73, anchor_id=819, color="#3B82F6", icon="INFO", title="Dormitorio principal",
						description="Armario empotrado y pavimento de roble.", title_position="ABOVE",
					),
					piece(
						x=6.08, y=-2.22, z=4.54, anchor_id=6652, color="#14B8A6", icon="PIN", title="Acceso",
						description="Puerta de entrada de 1250 x 2010 mm.", title_position="RIGHT",
					),
				],
			),
			Visualization(
				user_id=operator2, bim_model_id=model, name="Notas de obra",
				description="Privada, con marcadores libres que no están anclados a ningún elemento.",
				pieces=[
					piece(
						x=6.5, y=-1.4, z=4.5, color="#F59E0B", icon="PIN", title="Acopio de material",
						description="Zona para el material de la semana que viene.",
					),
					piece(
						x=-2.8, y=-1.4, z=-10.0, color="#F59E0B", icon="PIN", title="Contenedor",
						description="Punto de recogida de escombros.", title_position="BELOW",
					),
					piece(
						x=1.9, y=4.6, z=-2.7, color="#EF4444", icon="WARNING", title="Cubierta",
						description="Revisar el remate antes de la lluvia.", text_color="#FFA500",
					),
				],
			),
		];

	@staticmethod
	def _get_hub(admin: int, operator: int, operator2: int, model: int) -> list[Visualization]:
		"""Devuelve las visualizaciones del Digital Hub: mantenimiento, evacuación, incidencias y sótano.

		Args:
			admin: Identificador del administrador.
			operator: Identificador del primer operador.
			operator2: Identificador del segundo operador.
			model: Identificador del modelo del Digital Hub.

		Returns:
			Las visualizaciones del Digital Hub.
		"""
		piece = BIMModelVisualizationMarkerPiece;
		return [
			Visualization(
				user_id=operator, bim_model_id=model, name="Inspección de mantenimiento", is_public=True,
				description="Los marcadores se atenúan si el ratón no está encima.",
				pieces=[
					piece(
						x=18.65, y=0.53, z=5.78, anchor_id=4744, color="#22C55E", icon="CHECK", title="Sala 1-1",
						description="Revisión trimestral realizada.", dim_when_idle=True, highlight_on_select=True,
					),
					piece(
						x=18.65, y=4.43, z=2.87, anchor_id=12036, color="#22C55E", icon="CHECK", title="Sala 2-1",
						description="Pendiente de la próxima revisión.", dim_when_idle=True, highlight_on_select=True,
					),
					piece(
						x=-10.02, y=4.43, z=4.97, anchor_id=15258, color="#F59E0B", icon="WARNING", title="Sala 2-2",
						description="Ventilación con ruido.", link=DemoVisualizationData._BIM_LINK,
						dim_when_idle=True, highlight_on_select=True,
					),
					piece(
						x=-5.07, y=-3.46, z=3.21, anchor_id=35479, color="#F59E0B", icon="WARNING", size=1.2,
						title="Escalera del sótano", description="Revisar el antideslizante.",
						dim_when_idle=True, highlight_on_select=True,
					),
				],
			),
			Visualization(
				user_id=admin, bim_model_id=model, name="Evacuación y accesos", is_public=True,
				description="Salidas de emergencia de la planta baja y escalera de evacuación.",
				pieces=[
					piece(
						x=0.4, y=0.08, z=0.05, anchor_id=57325, color="#22C55E", icon="FLAG", title="Salida 1",
						description="Puerta de emergencia EN 179.",
						link=DemoVisualizationData._BIM_LINK, link_target="CURRENT_TAB", title_position="ABOVE",
					),
					piece(
						x=-5.77, y=0.08, z=0.86, anchor_id=61366, color="#22C55E", icon="FLAG", title="Salida 2",
						description="Puerta de emergencia EN 179.", title_position="ABOVE",
					),
					piece(
						x=-12.77, y=0.08, z=0.86, anchor_id=66265, color="#22C55E", icon="FLAG", title="Salida 3",
						description="Puerta de emergencia EN 179.", title_position="ABOVE",
					),
					piece(
						x=36.91, y=0.08, z=0.05, anchor_id=90017, color="#22C55E", icon="FLAG", title="Salida 4",
						description="Puerta de emergencia EN 179.", title_position="ABOVE",
					),
					piece(
						x=16.82, y=0.07, z=3.68, anchor_id=95172, color="#3B82F6", icon="INFO", size=1.3,
						title="Escalera de evacuación", description="Comunica las plantas en caso de evacuación.",
						highlight_on_select=True,
					),
				],
			),
			Visualization(
				user_id=operator2, bim_model_id=model, name="Incidencias abiertas",
				description="Privada del segundo operador.",
				pieces=[
					piece(
						x=47.33, y=4.43, z=4.97, anchor_id=17232, color="#EF4444", icon="WARNING", title="Fuga en 2-12",
						description="Gotera en el techo.", highlight_on_select=True,
					),
					piece(
						x=-9.32, y=4.43, z=9.85, anchor_id=18810, color="#EF4444", icon="WARNING", title="Luz 2-22",
						description="Luminaria fundida.", highlight_on_select=True,
					),
					piece(
						x=15.2, y=3.47, z=0.92, anchor_id=228169, color="#F59E0B", icon="PIN", title="Barandilla floja",
						description="Revisar los anclajes.", text_color="#FFA500",
					),
				],
			),
			Visualization(
				user_id=operator2, bim_model_id=model, name="Sótano B01", is_public=True,
				description="Algunos marcadores quedan tapados por el modelo al mirar desde arriba.",
				pieces=[
					piece(
						x=18.65, y=-3.12, z=-1.27, anchor_id=500, color="#64748B", icon="PIN", title="Sala 0-1",
						description="No se ve a través del modelo.", visible_through_model=False,
					),
					piece(
						x=-3.73, y=-3.12, z=-1.27, anchor_id=1072, color="#64748B", icon="PIN", title="Sala 0-2",
						description="No se ve a través del modelo.", visible_through_model=False,
					),
					piece(
						x=-2.35, y=-3.07, z=-4.74, anchor_id=1242, color="#3B82F6", icon="INFO", title="Sala 0-3",
						description="Sí se ve a través del modelo.",
					),
					piece(
						x=18.65, y=-4.49, z=-0.55, anchor_id=28398, color="#A855F7", icon="FLAG", size=1.2,
						title="Losa de cimentación", description="Hormigón de 300 mm.", title_position="BELOW",
					),
				],
			),
		];

	@staticmethod
	def _get_wellness(admin: int, operator: int, operator2: int, model: int) -> list[Visualization]:
		"""Devuelve las visualizaciones del centro de bienestar: zonas, marcadores agrupados y un borrador de señalización.

		Args:
			admin: Identificador del administrador.
			operator: Identificador del primer operador.
			operator2: Identificador del segundo operador.
			model: Identificador del modelo del centro de bienestar.

		Returns:
			Las visualizaciones del centro de bienestar.
		"""
		piece = BIMModelVisualizationMarkerPiece;
		return [
			Visualization(
				user_id=admin, bim_model_id=model, name="Zonas del centro", is_public=True,
				description="Título en distintas posiciones y colores.",
				pieces=[
					piece(
						x=-0.59, y=0.39, z=0.28, anchor_id=463861, color="#3B82F6", icon="INFO", size=1.3, title="Recepción",
						description="Atención al cliente. Horario de 8:00 a 21:00.",
						link=DemoVisualizationData._IFC_LINK, title_position="ABOVE",
					),
					piece(
						x=-0.26, y=4.64, z=7.08, anchor_id=348017, color="#A855F7", icon="PIN", title="Estudio de pilates",
						description="Máquinas Reformer y Cadillac.", text_color="#E9D5FF", title_position="RIGHT",
					),
					piece(
						x=0.67, y=9.29, z=2.96, anchor_id=522897, color="#F59E0B", icon="FLAG", title="Gimnasio",
						description="Sala de cardio con cintas y elípticas.",
						link=DemoVisualizationData._BIM_LINK, link_target="CURRENT_TAB", title_position="BELOW",
					),
					piece(
						x=-9.69, y=-0.06, z=11.85, anchor_id=266525, color="#64748B", icon="PIN", opacity=0.7,
						title="Aparcamiento", description="Plazas de 4800 x 2400 mm.", title_position="RIGHT",
					),
					piece(
						x=-2.09, y=1.06, z=7.48, anchor_id=76108, color="#22C55E", icon="CHECK", title="Entrada",
						description="Puerta exterior doble acristalada.", title_position="HIDDEN",
					),
				],
			),
			Visualization(
				user_id=operator, bim_model_id=model, name="Marcadores agrupados", is_public=True,
				description="Cuatro duchas y un aseo muy juntos: se agrupan al alejar la cámara.",
				pieces=[
					piece(
						x=7.43, y=1.0, z=1.4, anchor_id=266235, color="#0EA5E9", icon="PIN", title="Ducha 1",
						description="Puerta corredera.",
					),
					piece(
						x=8.4, y=1.0, z=1.65, anchor_id=266283, color="#0EA5E9", icon="PIN", title="Ducha 2",
						description="Puerta corredera.",
					),
					piece(
						x=9.59, y=1.0, z=1.97, anchor_id=266318, color="#0EA5E9", icon="PIN", title="Ducha 3",
						description="Puerta corredera.",
					),
					piece(
						x=10.13, y=1.0, z=-0.05, anchor_id=266353, color="#0EA5E9", icon="PIN", title="Ducha 4",
						description="Puerta corredera.",
					),
					piece(
						x=6.89, y=-0.06, z=-2.08, anchor_id=226072, color="#14B8A6", icon="INFO", title="Aseo",
						description="Inodoro de vestuario.",
					),
				],
			),
			Visualization(
				user_id=operator2, bim_model_id=model, name="Borrador de señalización",
				description="Privada: escaleras y barandillas.",
				pieces=[
					piece(
						x=-5.85, y=1.02, z=-7.03, anchor_id=547498, color="#F59E0B", icon="WARNING", title="Escalera",
						description="Poner cinta antideslizante.", highlight_on_select=True,
					),
					piece(
						x=-6.87, y=2.78, z=-6.99, anchor_id=669066, color="#F59E0B", icon="PIN", title="Barandilla",
						description="Altura de 1100 mm. Añadir rótulo de aforo.", title_position="RIGHT",
					),
					piece(
						x=-1.5, y=1.0, z=8.0, color="#22C55E", icon="FLAG", title="Cartel de bienvenida",
						description="Marcador libre: aún sin anclar.",
					),
				],
			),
		];

	# endregion PRIVATE STATIC METHODS
