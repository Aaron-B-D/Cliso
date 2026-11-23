import { BimViewerMarkerIcon, BimViewerMarkerTitlePosition } from 'src/app/shared/definitions/bimViewer.definitions';
import { BimViewerMarker } from 'src/app/shared/models/bimViewer/bimViewerMarker.models';
import { CheckUtils } from 'src/app/shared/utils/check.utils';

/** Dibuja en un lienzo las imágenes con las que el visor pinta los marcadores y los grupos de marcadores. */
export class BimViewerMarkerPainter {
	//#region PUBLIC CONSTANTS

	/** Radio, en píxeles de la imagen del marcador, del círculo del icono. */
	public static readonly CIRCLE_RADIUS: number = 44;

	/** Lado, en píxeles, de la imagen con la que se pinta cada marcador. */
	public static readonly TEXTURE_SIZE: number = 256;

	/** Veces que la imagen de un marcador es más ancha que alta cuando su título va a la derecha del círculo. */
	public static readonly TITLE_RIGHT_WIDTH_FACTOR: number = 2;

	//#endregion PUBLIC CONSTANTS

	//#region PRIVATE CONSTANTS

	/** Grosor, en píxeles, del borde blanco del círculo de un marcador. */
	private static readonly _CIRCLE_LINE_WIDTH: number = 5;

	/** Negro, para los bordes y los contornos (el lienzo no lee los tokens de color de la hoja de estilos). */
	private static readonly _COLOR_BLACK: string = '#000000';

	/** Blanco, para los bordes, los iconos y los anillos (el lienzo no lee los tokens de color de la hoja de estilos). */
	private static readonly _COLOR_WHITE: string = '#ffffff';

	/** Distancia, desde el centro del glifo de la bandera, a su extremo inferior. */
	private static readonly _FLAG_BOTTOM_Y_OFFSET: number = 2;

	/** Distancia, desde el centro del glifo de la bandera, al extremo de su mástil. */
	private static readonly _FLAG_HALF_HEIGHT: number = 22;

	/** Grosor, en píxeles, del mástil de la bandera. */
	private static readonly _FLAG_LINE_WIDTH: number = 6;

	/** Distancia horizontal, desde el centro, al mástil de la bandera. */
	private static readonly _FLAG_POLE_X_OFFSET: number = 12;

	/** Distancia horizontal, desde el centro, a la punta de la bandera. */
	private static readonly _FLAG_TIP_X_OFFSET: number = 22;

	/** Distancia vertical, desde el centro, a la punta de la bandera. */
	private static readonly _FLAG_TIP_Y_OFFSET: number = 10;

	/** Ángulo de una circunferencia completa, en radianes. */
	private static readonly _FULL_CIRCLE: number = 2 * Math.PI;

	/** Grosor, en píxeles, del borde negro del círculo de un grupo. */
	private static readonly _GROUP_OUTLINE_WIDTH: number = 6;

	/** Fuente de los glifos del icono y del número de un grupo. */
	private static readonly _ICON_FONT: string = 'bold 56px sans-serif';

	/** Desplazamiento vertical, en píxeles, que centra visualmente un glifo de texto en el círculo. */
	private static readonly _ICON_TEXT_OFFSET_Y: number = 3;

	/** Radio, en píxeles, del punto del icono de chincheta. */
	private static readonly _PIN_RADIUS: number = 14;

	/** Distancia, en píxeles, entre el círculo de un marcador y su anillo de selección. */
	private static readonly _SELECTION_RING_GAP: number = 12;

	/** Grosor, en píxeles, del anillo blanco de selección. */
	private static readonly _SELECTION_RING_INNER_LINE_WIDTH: number = 6;

	/** Grosor, en píxeles, del borde negro del anillo de selección. */
	private static readonly _SELECTION_RING_OUTER_LINE_WIDTH: number = 12;

	/** Fuente del título de un marcador. */
	private static readonly _TITLE_FONT: string = 'bold 30px sans-serif';

	/** Grosor, en píxeles, del contorno negro del título de un marcador. */
	private static readonly _TITLE_LINE_WIDTH: number = 6;

	/** Máximo de letras del título de un marcador que se pintan; el resto se sustituye por puntos suspensivos. */
	private static readonly _TITLE_MAX_LENGTH: number = 16;

	/** Separación horizontal, en píxeles, entre el círculo y un título escrito a su derecha. */
	private static readonly _TITLE_OFFSET_X: number = 16;

	/** Separación vertical, en píxeles, entre el círculo y un título escrito encima o debajo. */
	private static readonly _TITLE_OFFSET_Y: number = 34;

	//#endregion PRIVATE CONSTANTS

	//#region PUBLIC STATIC METHODS

	/**
	 * Dibuja la imagen de un grupo: un círculo blanco con el número de marcadores que reúne.
	 * @param count Número de marcadores del grupo.
	 * @returns El lienzo con la imagen.
	 */
	public static CreateGroupCanvas(count: number): HTMLCanvasElement {
		const size: number = BimViewerMarkerPainter.TEXTURE_SIZE;
		const canvas: HTMLCanvasElement = document.createElement('canvas');
		const context: CanvasRenderingContext2D | null = canvas.getContext('2d');

		canvas.width = size;
		canvas.height = size;

		if (CheckUtils.IsNull(context)) {
			console.warn('BimViewerMarkerPainter.CreateGroupCanvas() => no se ha podido crear la imagen del grupo');
		} else {
			context.beginPath();
			context.arc(size / 2, size / 2, BimViewerMarkerPainter.CIRCLE_RADIUS, 0, BimViewerMarkerPainter._FULL_CIRCLE);
			context.fillStyle = BimViewerMarkerPainter._COLOR_WHITE;
			context.fill();
			context.lineWidth = BimViewerMarkerPainter._GROUP_OUTLINE_WIDTH;
			context.strokeStyle = BimViewerMarkerPainter._COLOR_BLACK;
			context.stroke();
			context.fillStyle = BimViewerMarkerPainter._COLOR_BLACK;
			context.font = BimViewerMarkerPainter._ICON_FONT;
			context.textAlign = 'center';
			context.textBaseline = 'middle';
			context.fillText(String(count), size / 2, size / 2 + BimViewerMarkerPainter._ICON_TEXT_OFFSET_Y);
		}

		return canvas;
	}

	/**
	 * Dibuja la imagen de un marcador: un círculo de su color con su icono y, según su posición, su título. Con el título a la
	 * derecha, la imagen es el doble de ancha y el círculo queda en su mitad izquierda.
	 * @param marker Marcador a dibujar.
	 * @param isSelected `true` si el marcador está seleccionado: lleva un anillo blanco con borde negro.
	 * @returns El lienzo con la imagen.
	 */
	public static CreateMarkerCanvas(marker: BimViewerMarker, isSelected: boolean): HTMLCanvasElement {
		const size: number = BimViewerMarkerPainter.TEXTURE_SIZE;
		const isTitleRight: boolean = marker.TitlePosition === BimViewerMarkerTitlePosition.RIGHT;
		const canvas: HTMLCanvasElement = document.createElement('canvas');
		const context: CanvasRenderingContext2D | null = canvas.getContext('2d');

		canvas.width = isTitleRight ? size * BimViewerMarkerPainter.TITLE_RIGHT_WIDTH_FACTOR : size;
		canvas.height = size;

		if (CheckUtils.IsNull(context)) {
			console.warn('BimViewerMarkerPainter.CreateMarkerCanvas() => no se ha podido crear la imagen del marcador');
		} else {
			const center: number = size / 2;
			const radius: number = BimViewerMarkerPainter.CIRCLE_RADIUS;

			if (isSelected) {
				context.beginPath();
				context.arc(center, center, radius + BimViewerMarkerPainter._SELECTION_RING_GAP, 0, BimViewerMarkerPainter._FULL_CIRCLE);
				context.lineWidth = BimViewerMarkerPainter._SELECTION_RING_OUTER_LINE_WIDTH;
				context.strokeStyle = BimViewerMarkerPainter._COLOR_BLACK;
				context.stroke();
				context.lineWidth = BimViewerMarkerPainter._SELECTION_RING_INNER_LINE_WIDTH;
				context.strokeStyle = BimViewerMarkerPainter._COLOR_WHITE;
				context.stroke();
			} else {
				// Un marcador sin seleccionar no lleva anillo
			}

			context.beginPath();
			context.arc(center, center, radius, 0, BimViewerMarkerPainter._FULL_CIRCLE);
			context.fillStyle = marker.Color.HexColor;
			context.fill();
			context.lineWidth = BimViewerMarkerPainter._CIRCLE_LINE_WIDTH;
			context.strokeStyle = BimViewerMarkerPainter._COLOR_WHITE;
			context.stroke();
			BimViewerMarkerPainter.drawMarkerIcon(context, marker.Icon, center);
			BimViewerMarkerPainter.drawMarkerTitle(context, marker, center, radius);
		}

		return canvas;
	}

	//#endregion PUBLIC STATIC METHODS

	//#region PRIVATE STATIC METHODS

	/**
	 * Dibuja en blanco, sobre el círculo de un marcador, el glifo de su icono.
	 * @param context Contexto del lienzo del marcador.
	 * @param icon Icono a dibujar.
	 * @param center Coordenada del centro del círculo (la misma en X y en Y).
	 */
	private static drawMarkerIcon(context: CanvasRenderingContext2D, icon: BimViewerMarkerIcon, center: number): void {
		const textY: number = center + BimViewerMarkerPainter._ICON_TEXT_OFFSET_Y;

		context.fillStyle = BimViewerMarkerPainter._COLOR_WHITE;
		context.strokeStyle = BimViewerMarkerPainter._COLOR_WHITE;
		context.font = BimViewerMarkerPainter._ICON_FONT;
		context.textAlign = 'center';
		context.textBaseline = 'middle';

		switch (icon) {
			case BimViewerMarkerIcon.CHECK:
				context.fillText('✓', center, textY);
				break;
			case BimViewerMarkerIcon.FLAG:
				context.lineWidth = BimViewerMarkerPainter._FLAG_LINE_WIDTH;
				context.beginPath();
				context.moveTo(center - BimViewerMarkerPainter._FLAG_POLE_X_OFFSET, center + BimViewerMarkerPainter._FLAG_HALF_HEIGHT);
				context.lineTo(center - BimViewerMarkerPainter._FLAG_POLE_X_OFFSET, center - BimViewerMarkerPainter._FLAG_HALF_HEIGHT);
				context.stroke();
				context.beginPath();
				context.moveTo(center - BimViewerMarkerPainter._FLAG_POLE_X_OFFSET, center - BimViewerMarkerPainter._FLAG_HALF_HEIGHT);
				context.lineTo(center + BimViewerMarkerPainter._FLAG_TIP_X_OFFSET, center - BimViewerMarkerPainter._FLAG_TIP_Y_OFFSET);
				context.lineTo(center - BimViewerMarkerPainter._FLAG_POLE_X_OFFSET, center + BimViewerMarkerPainter._FLAG_BOTTOM_Y_OFFSET);
				context.closePath();
				context.fill();
				break;
			case BimViewerMarkerIcon.INFO:
				context.fillText('i', center, textY);
				break;
			case BimViewerMarkerIcon.PIN:
				context.beginPath();
				context.arc(center, center, BimViewerMarkerPainter._PIN_RADIUS, 0, BimViewerMarkerPainter._FULL_CIRCLE);
				context.fill();
				break;
			case BimViewerMarkerIcon.WARNING:
				context.fillText('!', center, textY);
				break;
			default:
				console.warn(`BimViewerMarkerPainter.drawMarkerIcon() => icono no soportado: ${icon}`);
				break;
		}
	}

	/**
	 * Escribe el título de un marcador, recortado si es largo, en el lugar y con el color que indica el marcador.
	 * @param context Contexto del lienzo del marcador.
	 * @param marker Marcador cuyo título se escribe. Sin título o con la posición oculta, no escribe nada.
	 * @param center Coordenada del centro del círculo (la misma en X y en Y).
	 * @param radius Radio del círculo.
	 */
	private static drawMarkerTitle(context: CanvasRenderingContext2D, marker: BimViewerMarker, center: number, radius: number): void {
		const maxLength: number = BimViewerMarkerPainter._TITLE_MAX_LENGTH;
		const title: string = marker.Text;

		if (CheckUtils.IsEmptyString(title) || marker.TitlePosition === BimViewerMarkerTitlePosition.HIDDEN) {
			// Sin título, o con el título oculto, no hay nada que escribir
		} else {
			const text: string = title.length > maxLength ? `${title.substring(0, maxLength - 1)}…` : title;
			let x: number = center;
			let y: number = center;

			context.textAlign = 'center';

			switch (marker.TitlePosition) {
				case BimViewerMarkerTitlePosition.ABOVE:
					y = center - radius - BimViewerMarkerPainter._TITLE_OFFSET_Y;
					break;
				case BimViewerMarkerTitlePosition.BELOW:
					y = center + radius + BimViewerMarkerPainter._TITLE_OFFSET_Y;
					break;
				case BimViewerMarkerTitlePosition.RIGHT:
					x = center + radius + BimViewerMarkerPainter._TITLE_OFFSET_X;
					context.textAlign = 'left';
					break;
				default:
					console.warn(`BimViewerMarkerPainter.drawMarkerTitle() => posición del título no soportada: ${marker.TitlePosition}`);
					break;
			}

			context.font = BimViewerMarkerPainter._TITLE_FONT;
			context.textBaseline = 'middle';
			context.lineWidth = BimViewerMarkerPainter._TITLE_LINE_WIDTH;
			context.lineJoin = 'round';
			context.strokeStyle = BimViewerMarkerPainter._COLOR_BLACK;
			context.strokeText(text, x, y);
			context.fillStyle = marker.TextColor.HexColor;
			context.fillText(text, x, y);
		}
	}

	//#endregion PRIVATE STATIC METHODS
}
