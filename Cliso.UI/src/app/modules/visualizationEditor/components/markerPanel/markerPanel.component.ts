import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { AbstractControlOptions, FormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

import {
	BimViewerMarkerIcon,
	BimViewerMarkerLinkTarget,
	BimViewerMarkerTitlePosition
} from 'src/app/shared/definitions/bimViewer.definitions';
import { BimViewerElement } from 'src/app/shared/models/bimViewer/bimViewerElement.models';
import { BimViewerPoint } from 'src/app/shared/models/bimViewer/bimViewerPoint.models';
import { STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { CheckboxReadOnlyDirective } from 'src/app/shared/directives/checkboxReadOnly.directive';
import { ReadOnlyDirective } from 'src/app/shared/directives/readOnly.directive';
import { SelectReadOnlyDirective } from 'src/app/shared/directives/selectReadOnly.directive';
import { Color } from 'src/app/shared/models/color/color.models';
import { BimModelVisualizationMarkerPiece } from 'src/app/shared/models/visualization/bimModelVisualizationMarkerPiece.models';
import { VisualizationPiece } from 'src/app/shared/models/visualization/visualizationPiece.models';
import { CheckUtils } from 'src/app/shared/utils/check.utils';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';

/** Opción del desplegable de anclaje: un elemento del modelo con su texto ya preparado. */
type MarkerAnchorOption = {
	Id: number;
	Text: string;
};

/** Opción del desplegable de iconos. */
type MarkerIconOption = {
	Text: string;
	Value: BimViewerMarkerIcon;
};

/** Opción del desplegable de destino del enlace. */
type MarkerLinkTargetOption = {
	Text: string;
	Value: BimViewerMarkerLinkTarget;
};

/** Opción del desplegable de posición del título. */
type MarkerTitlePositionOption = {
	Text: string;
	Value: BimViewerMarkerTitlePosition;
};

/** Panel de detalle de una pieza de tipo marcador: contenido, aspecto, comportamiento, coordenadas y anclaje a un elemento del modelo. */
@Component({
	selector: 'app-visualization-marker-panel',
	imports: [
		FormsModule,
		MatAutocompleteModule,
		MatButtonModule,
		MatFormFieldModule,
		MatInputModule,
		MatSelectModule,
		MatSlideToggleModule,
		MatTooltipModule,
		CheckboxReadOnlyDirective,
		ReadOnlyDirective,
		SelectReadOnlyDirective
	],
	templateUrl: './markerPanel.component.html',
	styleUrl: './markerPanel.component.scss'
})
export class VisualizationMarkerPanelComponent implements OnChanges, OnDestroy {
	//#region DECORATORS

	/** `true` si el usuario puede cambiar el marcador. */
	@Input() public CanEdit: boolean = false;

	/** Se emite con el identificador del elemento del modelo al que se acaba de anclar el marcador. */
	@Output() public anchored: EventEmitter<number> = new EventEmitter<number>();

	/** Se emite cuando se ha cambiado algún dato del marcador. */
	@Output() public changed: EventEmitter<void> = new EventEmitter<void>();

	/** Elementos del modelo a los que se puede anclar el marcador. Vacío mientras no se han cargado. */
	@Input() public Elements: BimViewerElement[] = [];

	/** Se emite al pedir la lista de elementos del modelo, que se carga solo cuando hace falta. */
	@Output() public elementsRequested: EventEmitter<void> = new EventEmitter<void>();

	/** `true` mientras se carga la lista de elementos del modelo. */
	@Input() public IsLoadingElements: boolean = false;

	/** Pieza seleccionada, de cualquier tipo. Este panel solo la muestra si es un marcador. */
	@Input() public Piece: VisualizationPiece | null = null;

	//#endregion DECORATORS

	//#region PUBLIC CONSTANTS

	/** Etiqueta de la coordenada X. */
	public readonly AXIS_X: string = 'X';

	/** Etiqueta de la coordenada Y. */
	public readonly AXIS_Y: string = 'Y';

	/** Etiqueta de la coordenada Z. */
	public readonly AXIS_Z: string = 'Z';

	/** Opciones de los campos cuyo valor se toma al salir del campo, no a cada tecla, para no cambiarlo mientras se escribe. */
	public readonly BLUR_OPTIONS: AbstractControlOptions = { updateOn: 'blur' };

	/** Longitud máxima de la descripción. */
	public readonly MAX_DESCRIPTION_LENGTH: number = 1000;

	/** Longitud máxima del enlace. */
	public readonly MAX_LINK_LENGTH: number = 2000;

	/** Opacidad máxima en porcentaje. */
	public readonly MAX_OPACITY_PERCENT: number = 100;

	/** Tamaño máximo de un marcador. */
	public readonly MAX_SIZE: number = 10;

	/** Longitud máxima del título. */
	public readonly MAX_TITLE_LENGTH: number = 100;

	/** Opacidad mínima en porcentaje. */
	public readonly MIN_OPACITY_PERCENT: number = 0;

	/** Tamaño mínimo de un marcador. */
	public readonly MIN_SIZE: number = 0.1;

	/** Cuánto cambia la opacidad (en porcentaje) con las flechas de la casilla. */
	public readonly OPACITY_STEP: number = 5;

	/** Cuánto cambia una coordenada con las flechas de su casilla. */
	public readonly POSITION_STEP: number = 0.1;

	/** Cuánto cambia el tamaño con las flechas de la casilla. */
	public readonly SIZE_STEP: number = 0.1;

	//#region LANGUAGE TEXTS

	/** Etiqueta del elemento del modelo al que se ancla el marcador. */
	public readonly ANCHOR_TEXT: string = LanguageManager.GetText('VMP_ANCHOR');

	/** Etiqueta del color. */
	public readonly COLOR_TEXT: string = LanguageManager.GetText('VMP_COLOR');

	/** Etiqueta de la descripción. */
	public readonly DESCRIPTION_TEXT: string = LanguageManager.GetText('VMP_DESCRIPTION');

	/** Interruptor de atenuar el marcador en reposo. */
	public readonly DIM_WHEN_IDLE_TEXT: string = LanguageManager.GetText('VMP_DIM_WHEN_IDLE');

	/** Interruptor de resaltar el elemento anclado. */
	public readonly HIGHLIGHT_ON_SELECT_TEXT: string = LanguageManager.GetText('VMP_HIGHLIGHT_ON_SELECT');

	/** Etiqueta del icono. */
	public readonly ICON_TEXT: string = LanguageManager.GetText('VMP_ICON');

	/** Etiqueta del destino del enlace. */
	public readonly LINK_TARGET_TEXT: string = LanguageManager.GetText('VMP_LINK_TARGET');

	/** Etiqueta del enlace. */
	public readonly LINK_TEXT: string = LanguageManager.GetText('VMP_LINK');

	/** Texto del desplegable de anclaje mientras se cargan los elementos. */
	public readonly LOADING_TEXT: string = LanguageManager.GetText('WEB_LOADING');

	/** Texto del desplegable de anclaje cuando ningún elemento coincide con lo escrito. */
	public readonly NO_RESULTS_TEXT: string = LanguageManager.GetText('VMP_NO_RESULTS');

	/** Etiqueta de la opacidad. */
	public readonly OPACITY_TEXT: string = LanguageManager.GetText('VMP_OPACITY');

	/** Botón que quita el anclaje. */
	public readonly RELEASE_TEXT: string = LanguageManager.GetText('VMP_RELEASE');

	/** Título de la sección de aspecto. */
	public readonly SECTION_APPEARANCE_TEXT: string = LanguageManager.GetText('VMP_SECTION_APPEARANCE');

	/** Título de la sección de comportamiento. */
	public readonly SECTION_BEHAVIOR_TEXT: string = LanguageManager.GetText('VMP_SECTION_BEHAVIOR');

	/** Título de la sección de contenido. */
	public readonly SECTION_CONTENT_TEXT: string = LanguageManager.GetText('VMP_SECTION_CONTENT');

	/** Título de la sección de posición y anclaje. */
	public readonly SECTION_POSITION_TEXT: string = LanguageManager.GetText('VMP_SECTION_POSITION');

	/** Etiqueta del tamaño. */
	public readonly SIZE_TEXT: string = LanguageManager.GetText('VMP_SIZE');

	/** Etiqueta del color del título. */
	public readonly TEXT_COLOR_TEXT: string = LanguageManager.GetText('VMP_TEXT_COLOR');

	/** Etiqueta de la posición del título. */
	public readonly TITLE_POSITION_TEXT: string = LanguageManager.GetText('VMP_TITLE_POSITION');

	/** Etiqueta del título. */
	public readonly TITLE_TEXT: string = LanguageManager.GetText('VMP_TITLE');

	/** Interruptor de ver el marcador a través del modelo. */
	public readonly VISIBLE_THROUGH_MODEL_TEXT: string = LanguageManager.GetText('VMP_VISIBLE_THROUGH_MODEL');

	//#endregion LANGUAGE TEXTS

	//#endregion PUBLIC CONSTANTS

	//#region PRIVATE CONSTANTS

	/** Máximo de elementos que se ofrecen a la vez en el desplegable de anclaje. */
	private readonly _MAX_ANCHOR_OPTIONS: number = 50;

	//#region LANGUAGE TEXTS

	/** Nombre del icono de comprobación. */
	private readonly _ICON_CHECK_TEXT: string = LanguageManager.GetText('VMP_ICON_CHECK');

	/** Nombre del icono de bandera. */
	private readonly _ICON_FLAG_TEXT: string = LanguageManager.GetText('VMP_ICON_FLAG');

	/** Nombre del icono de información. */
	private readonly _ICON_INFO_TEXT: string = LanguageManager.GetText('VMP_ICON_INFO');

	/** Nombre del icono de chincheta. */
	private readonly _ICON_PIN_TEXT: string = LanguageManager.GetText('VMP_ICON_PIN');

	/** Nombre del icono de aviso. */
	private readonly _ICON_WARNING_TEXT: string = LanguageManager.GetText('VMP_ICON_WARNING');

	/** Opción de abrir el enlace en la pestaña actual. */
	private readonly _LINK_TARGET_CURRENT_TAB_TEXT: string = LanguageManager.GetText('VMP_LINK_TARGET_CURRENT_TAB');

	/** Opción de abrir el enlace en una ventana nueva. */
	private readonly _LINK_TARGET_NEW_WINDOW_TEXT: string = LanguageManager.GetText('VMP_LINK_TARGET_NEW_WINDOW');

	/** Opción de poner el título encima del icono. */
	private readonly _TITLE_POSITION_ABOVE_TEXT: string = LanguageManager.GetText('VMP_TITLE_POSITION_ABOVE');

	/** Opción de poner el título debajo del icono. */
	private readonly _TITLE_POSITION_BELOW_TEXT: string = LanguageManager.GetText('VMP_TITLE_POSITION_BELOW');

	/** Opción de no poner título. */
	private readonly _TITLE_POSITION_HIDDEN_TEXT: string = LanguageManager.GetText('VMP_TITLE_POSITION_HIDDEN');

	/** Opción de poner el título a la derecha del icono. */
	private readonly _TITLE_POSITION_RIGHT_TEXT: string = LanguageManager.GetText('VMP_TITLE_POSITION_RIGHT');

	//#endregion LANGUAGE TEXTS

	//#endregion PRIVATE CONSTANTS

	//#region PUBLIC PROPERTIES

	/** Elemento al que está anclado el marcador, escrito como `nombre · id`. Vacío si está libre. */
	public AnchorText: string = '';

	/** Elementos que se ofrecen en el desplegable de anclaje, filtrados por lo escrito. */
	public AnchorOptions: MarkerAnchorOption[] = [];

	/** `true` si se puede soltar el marcador del elemento: se puede editar y está anclado. */
	public CanRelease: boolean = false;

	/** Iconos entre los que se elige. */
	public IconOptions: MarkerIconOption[] = [];

	/** `true` si el marcador está anclado a un elemento. */
	public IsAnchored: boolean = false;

	/** `true` si no se puede cambiar el resaltado del elemento: no se puede editar o el marcador está libre. */
	public IsHighlightDisabled: boolean = true;

	/** `true` si los campos solo se pueden leer: el usuario no puede cambiar la pieza. */
	public IsReadOnly: boolean = true;

	/** `true` si no se puede cambiar el destino del enlace: no se puede editar o el marcador no tiene enlace. */
	public IsLinkTargetDisabled: boolean = true;

	/** Destinos del enlace entre los que se elige. */
	public LinkTargetOptions: MarkerLinkTargetOption[] = [];

	/** La pieza recibida como marcador. Mientras no llegue un marcador, es uno vacío. */
	public Marker: BimModelVisualizationMarkerPiece = BimModelVisualizationMarkerPiece.CreateDefault();

	/** Opacidad del marcador en porcentaje, de 0 a 100. */
	public OpacityPercent: number = this.MAX_OPACITY_PERCENT;

	/** Posiciones del título entre las que se elige. */
	public TitlePositionOptions: MarkerTitlePositionOption[] = [];

	//#endregion PUBLIC PROPERTIES

	//#region PRIVATE PROPERTIES

	/** Texto escrito en el desplegable de anclaje para filtrar los elementos, en minúsculas. */
	private _AnchorFilter: string = '';

	//#endregion PRIVATE PROPERTIES

	//#region CONSTRUCTOR

	constructor() {
		this.IconOptions = [
			{ Text: this._ICON_CHECK_TEXT, Value: BimViewerMarkerIcon.CHECK },
			{ Text: this._ICON_FLAG_TEXT, Value: BimViewerMarkerIcon.FLAG },
			{ Text: this._ICON_INFO_TEXT, Value: BimViewerMarkerIcon.INFO },
			{ Text: this._ICON_PIN_TEXT, Value: BimViewerMarkerIcon.PIN },
			{ Text: this._ICON_WARNING_TEXT, Value: BimViewerMarkerIcon.WARNING }
		];
		this.LinkTargetOptions = [
			{ Text: this._LINK_TARGET_CURRENT_TAB_TEXT, Value: BimViewerMarkerLinkTarget.CURRENT_TAB },
			{ Text: this._LINK_TARGET_NEW_WINDOW_TEXT, Value: BimViewerMarkerLinkTarget.NEW_WINDOW }
		];
		this.TitlePositionOptions = [
			{ Text: this._TITLE_POSITION_ABOVE_TEXT, Value: BimViewerMarkerTitlePosition.ABOVE },
			{ Text: this._TITLE_POSITION_BELOW_TEXT, Value: BimViewerMarkerTitlePosition.BELOW },
			{ Text: this._TITLE_POSITION_RIGHT_TEXT, Value: BimViewerMarkerTitlePosition.RIGHT },
			{ Text: this._TITLE_POSITION_HIDDEN_TEXT, Value: BimViewerMarkerTitlePosition.HIDDEN }
		];
	}

	//#endregion CONSTRUCTOR

	//#region EMITTERS

	private emitAnchored(id: number): void {
		this.anchored.emit(id);
	}

	private emitChanged(): void {
		this.changed.emit();
	}

	private emitElementsRequested(): void {
		this.elementsRequested.emit();
	}

	//#endregion EMITTERS

	//#region ANGULAR LIFECYCLE

	public ngOnChanges(): void {
		if (!CheckUtils.IsNull(this.Piece)) {
			// El detalle solo muestra este panel para piezas de tipo marcador
			this.Marker = this.Piece as BimModelVisualizationMarkerPiece;
		} else {
			// Aún no hay pieza: se queda el marcador vacío
		}

		this._AnchorFilter = '';
		this.IsReadOnly = !this.CanEdit;
		this.refreshLinkTarget();
		this.OpacityPercent = Math.round(this.Marker.Opacity * this.MAX_OPACITY_PERCENT);
		this.refreshAnchor();
	}

	public ngOnDestroy(): void {
		this.anchored.complete();
		this.changed.complete();
		this.elementsRequested.complete();
	}

	//#endregion ANGULAR LIFECYCLE

	//#region SUBSCRIBERS

	public OnAnchorFocused(): void {
		// Los elementos del modelo solo se piden cuando el usuario va a elegir uno
		if (this.Elements.length === 0 && !this.IsLoadingElements) {
			this.emitElementsRequested();
		} else {
			// Ya están cargadas o se están cargando
		}
	}

	public OnAnchorSelected(text: string): void {
		const option: MarkerAnchorOption | undefined = this.AnchorOptions.find((item: MarkerAnchorOption): boolean => item.Text === text);

		if (!CheckUtils.IsUndefined(option)) {
			this.Marker.AnchorId = option.Id;
			this._AnchorFilter = '';
			this.refreshAnchor();
			this.emitChanged();
			// Quien tiene acceso al visor recoloca el marcador en el elemento
			this.emitAnchored(option.Id);
		} else {
			// La opción ya no está en la lista: no hay elemento al que anclar
		}
	}

	public OnAnchorTextChanged(text: string): void {
		// Al elegir un elemento, el desplegable escribe su texto: no es un filtro
		this._AnchorFilter = text === this.AnchorText ? '' : text.trim().toLowerCase();
		this.refreshAnchorOptions();
	}

	public OnColorChanged(color: string): void {
		this.Marker.Color = new Color(color);
		this.emitChanged();
	}

	public OnDescriptionChanged(description: string): void {
		this.Marker.Description = description;
		this.emitChanged();
	}

	public OnDimWhenIdleChanged(isOn: boolean): void {
		this.Marker.DimWhenIdle = isOn;
		this.emitChanged();
	}

	public OnHighlightOnSelectChanged(isOn: boolean): void {
		this.Marker.HighlightOnSelect = isOn;
		this.emitChanged();
	}

	public OnIconChanged(icon: BimViewerMarkerIcon): void {
		this.Marker.Icon = icon;
		this.emitChanged();
	}

	public OnLinkChanged(link: string): void {
		// El API solo admite enlaces que empiecen por `http://` o `https://` y sin espacios: se completa lo que falte
		let normalized: string = link.trim().replace(/\s+/g, '%20');

		if (normalized !== '' && !normalized.startsWith('http://') && !normalized.startsWith('https://')) {
			normalized = `https://${normalized}`;
		} else {
			// Está vacío o ya empieza por un esquema admitido
		}

		if (normalized === 'http://' || normalized === 'https://') {
			// Solo se ha escrito el esquema: sin dirección no hay enlace
			normalized = STRING_UNDEFINED;
		} else {
			// Hay una dirección tras el esquema, o está vacío
		}

		this.Marker.Link = normalized;
		this.refreshLinkTarget();
		this.emitChanged();
	}

	public OnLinkTargetChanged(target: BimViewerMarkerLinkTarget): void {
		this.Marker.LinkTarget = target;
		this.emitChanged();
	}

	public OnOpacityChanged(percent: number | null): void {
		if (!CheckUtils.IsNull(percent)) {
			// Una opacidad fuera de rango se deja en el límite más cercano
			this.OpacityPercent = Math.min(this.MAX_OPACITY_PERCENT, Math.max(this.MIN_OPACITY_PERCENT, percent));
			this.Marker.Opacity = this.OpacityPercent / this.MAX_OPACITY_PERCENT;
			this.emitChanged();
		} else {
			// Casilla vacía: el marcador conserva su opacidad
		}
	}

	public OnReleaseClicked(): void {
		this.Marker.AnchorId = null;
		this._AnchorFilter = '';
		this.refreshAnchor();
		this.emitChanged();
	}

	public OnSizeChanged(size: number | null): void {
		if (!CheckUtils.IsNull(size)) {
			// Un tamaño fuera de rango se deja en el límite más cercano
			this.Marker.Size = Math.min(this.MAX_SIZE, Math.max(this.MIN_SIZE, size));
			this.emitChanged();
		} else {
			// Casilla vacía: el marcador conserva su tamaño
		}
	}

	public OnTextColorChanged(color: string): void {
		this.Marker.TextColor = new Color(color);
		this.emitChanged();
	}

	public OnTitleChanged(title: string): void {
		this.Marker.Title = title;
		this.emitChanged();
	}

	public OnTitlePositionChanged(position: BimViewerMarkerTitlePosition): void {
		this.Marker.TitlePosition = position;
		this.emitChanged();
	}

	public OnVisibleThroughModelChanged(isOn: boolean): void {
		this.Marker.VisibleThroughModel = isOn;
		this.emitChanged();
	}

	public OnXChanged(x: number | null): void {
		if (!CheckUtils.IsNull(x)) {
			this.setPosition(x, this.Marker.Position.Y, this.Marker.Position.Z);
		} else {
			// Casilla vacía: el marcador conserva su coordenada
		}
	}

	public OnYChanged(y: number | null): void {
		if (!CheckUtils.IsNull(y)) {
			this.setPosition(this.Marker.Position.X, y, this.Marker.Position.Z);
		} else {
			// Casilla vacía: el marcador conserva su coordenada
		}
	}

	public OnZChanged(z: number | null): void {
		if (!CheckUtils.IsNull(z)) {
			this.setPosition(this.Marker.Position.X, this.Marker.Position.Y, z);
		} else {
			// Casilla vacía: el marcador conserva su coordenada
		}
	}

	//#endregion SUBSCRIBERS

	//#region PRIVATE METHODS

	/** Deja calculado el texto del elemento al que está anclado el marcador y los elementos que se ofrecen para anclarlo. */
	private refreshAnchor(): void {
		const anchorId: number | null = this.Marker.AnchorId;

		this.IsAnchored = !CheckUtils.IsNull(anchorId);
		this.CanRelease = this.CanEdit && this.IsAnchored;
		this.IsHighlightDisabled = !this.CanEdit || !this.IsAnchored;

		if (CheckUtils.IsNull(anchorId)) {
			this.AnchorText = '';
		} else {
			const anchor: BimViewerElement | undefined = this.Elements.find((item: BimViewerElement): boolean => item.Id === anchorId);

			this.AnchorText = CheckUtils.IsUndefined(anchor) ? `#${anchorId}` : this.getElementText(anchor);
		}

		this.refreshAnchorOptions();
	}

	/** Deja calculado si se puede elegir el destino del enlace: solo si se puede editar y hay enlace. */
	private refreshLinkTarget(): void {
		this.IsLinkTargetDisabled = !this.CanEdit || this.Marker.Link === '';
	}

	/** Filtra los elementos del modelo por lo escrito en el desplegable de anclaje y se queda con las primeras. */
	private refreshAnchorOptions(): void {
		const filter: string = this._AnchorFilter;

		this.AnchorOptions = this.Elements.filter(
			(item: BimViewerElement): boolean => filter === '' || this.getElementText(item).toLowerCase().includes(filter)
		)
			.slice(0, this._MAX_ANCHOR_OPTIONS)
			.map((item: BimViewerElement): MarkerAnchorOption => ({ Id: item.Id, Text: this.getElementText(item) }));
	}

	/**
	 * Escribe un elemento del modelo como `nombre · id`; sin nombre, usa su categoría.
	 * @param element Elemento del modelo.
	 */
	private getElementText(element: BimViewerElement): string {
		const name: string = element.Name === '' ? element.Category : element.Name;

		return name === '' ? `#${element.Id}` : `${name} · ${element.Id}`;
	}

	/**
	 * Cambia la posición del marcador.
	 * @param x Nueva coordenada X.
	 * @param y Nueva coordenada Y.
	 * @param z Nueva coordenada Z.
	 */
	private setPosition(x: number, y: number, z: number): void {
		this.Marker.Position = new BimViewerPoint(x, y, z);
		this.emitChanged();
	}

	//#endregion PRIVATE METHODS
}
