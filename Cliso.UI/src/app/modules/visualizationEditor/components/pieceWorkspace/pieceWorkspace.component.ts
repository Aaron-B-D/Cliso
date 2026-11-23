import { Component, EventEmitter, Input, OnChanges, OnDestroy, Output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

import { VisualizationPieceDetailComponent } from 'src/app/modules/visualizationEditor/components/pieceDetail/pieceDetail.component';
import {
	VisualizationPieceListComponent,
	VisualizationPieceListItem
} from 'src/app/modules/visualizationEditor/components/pieceList/pieceList.component';
import { VisualizationPiecePickerComponent } from 'src/app/modules/visualizationEditor/components/piecePicker/piecePicker.component';
import { BimModelPreviewComponent } from 'src/app/shared/components/bimModelPreview/bimModelPreview.component';
import { BimViewerCompiledEvent, BimViewerMarkerMovedEvent } from 'src/app/shared/components/bimViewer/bimViewer.component';
import { IBimViewerAccess } from 'src/app/shared/definitions/bimViewer.definitions';
import { ID_NUMERIC_UNDEFINED, STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { IconName } from 'src/app/shared/definitions/icons.definitions';
import { NotificationLevel } from 'src/app/shared/definitions/notifications.definitions';
import { VisualizationPieceType, VisualizationPieceTypeInfo } from 'src/app/shared/definitions/visualization.definitions';
import { BimModel } from 'src/app/shared/models/bimModel/bimModel.models';
import { BimViewerElement } from 'src/app/shared/models/bimViewer/bimViewerElement.models';
import { BimViewerHit } from 'src/app/shared/models/bimViewer/bimViewerHit.models';
import { BimViewerMarker } from 'src/app/shared/models/bimViewer/bimViewerMarker.models';
import { BimViewerPoint } from 'src/app/shared/models/bimViewer/bimViewerPoint.models';
import { VisualizationPiece } from 'src/app/shared/models/visualization/visualizationPiece.models';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { CheckUtils } from 'src/app/shared/utils/check.utils';
import { ErrorUtils } from 'src/app/shared/utils/error.utils';
import { IconsUtils } from 'src/app/shared/utils/icons.utils';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';
import { StringUtils } from 'src/app/shared/utils/string.utils';
import { VisualizationPieceTypes } from 'src/app/shared/utils/visualization/visualizationPieceTypes.utils';

/**
 * Espacio de trabajo con las piezas de una visualización: el visor del modelo con sus marcadores y, junto a él, el panel
 * plegable con la lista de piezas y el detalle de la seleccionada. Coloca, mueve, ancla, cambia y quita piezas sobre la lista
 * que recibe, y avisa de que ha cambiado. El visor vive mientras vive este componente, y con él su acceso.
 */
@Component({
	selector: 'app-visualization-piece-workspace',
	imports: [
		BimModelPreviewComponent,
		MatButtonModule,
		MatTooltipModule,
		VisualizationPieceDetailComponent,
		VisualizationPieceListComponent,
		VisualizationPiecePickerComponent
	],
	templateUrl: './pieceWorkspace.component.html',
	styleUrl: './pieceWorkspace.component.scss'
})
export class VisualizationPieceWorkspaceComponent implements OnChanges, OnDestroy {
	//#region DECORATORS

	/** `true` si el usuario puede añadir, quitar, mover y cambiar piezas. */
	@Input() public CanEdit: boolean = false;

	/** Se emite cuando se ha cambiado la lista de piezas o alguna de ellas. */
	@Output() public changed: EventEmitter<void> = new EventEmitter<void>();

	/** Modelo BIM que se muestra. Es `null` si no hay modelo elegido. */
	@Input() public Model: BimModel | null = null;

	/**
	 * Piezas que se trabajan. Con `null` (aún no cargadas) no hay nada que mostrar ni cambiar. Excepción acordada a no
	 * modificar un `@Input`: la lista se cambia en su sitio (se añaden, quitan y mueven piezas) y se avisa con `changed`,
	 * para que quien la pasa conserve su copia de trabajo sin tener que recibir una lista nueva cada vez.
	 */
	@Input() public Pieces: VisualizationPiece[] | null = null;

	//#endregion DECORATORS

	//#region PUBLIC CONSTANTS

	//#region LANGUAGE TEXTS

	/** Indicación de que el siguiente clic en el modelo coloca la pieza elegida. */
	public readonly PLACING_TEXT: string = LanguageManager.GetText('VPW_PLACING');

	//#endregion LANGUAGE TEXTS

	//#endregion PUBLIC CONSTANTS

	//#region PRIVATE CONSTANTS

	/** Icono del botón cuando el panel de piezas está plegado: lo despliega hacia la izquierda. */
	private readonly _PANEL_COLLAPSED_ICON: string = IconsUtils.GetUrl(IconName.CHEVRONS_LEFT);

	/** Icono del botón cuando el panel de piezas está desplegado: lo pliega hacia la derecha. */
	private readonly _PANEL_EXPANDED_ICON: string = IconsUtils.GetUrl(IconName.CHEVRONS_RIGHT);

	//#region LANGUAGE TEXTS

	/** Aviso de que no se ha podido anclar la pieza al elemento elegido. */
	private readonly _ANCHOR_ERROR_TEXT: string = LanguageManager.GetText('VPW_ANCHOR_ERROR');

	/** Nombre por defecto de una pieza, con el nombre de su tipo en `{0}` y su número en `{1}`. */
	private readonly _DEFAULT_NAME_TEXT: string = LanguageManager.GetText('VPW_DEFAULT_NAME');

	/** Aviso de que no se han podido cargar los elementos del modelo para anclar piezas. */
	private readonly _ELEMENTS_LOAD_ERROR_TEXT: string = LanguageManager.GetText('VPW_ELEMENTS_LOAD_ERROR');

	/** Texto del botón cuando el panel de piezas está desplegado. */
	private readonly _HIDE_PANEL_TEXT: string = LanguageManager.GetText('VPW_HIDE_PANEL');

	/** Aviso de que no se ha podido llevar la vista a la pieza. */
	private readonly _LOCATE_ERROR_TEXT: string = LanguageManager.GetText('VPW_LOCATE_ERROR');

	/** Aviso de que no se ha podido crear la pieza del tipo elegido. */
	private readonly _PIECE_CREATE_ERROR_TEXT: string = LanguageManager.GetText('VPW_PIECE_CREATE_ERROR');

	/** Texto del botón cuando el panel de piezas está plegado. */
	private readonly _SHOW_PANEL_TEXT: string = LanguageManager.GetText('VPW_SHOW_PANEL');

	//#endregion LANGUAGE TEXTS

	//#endregion PRIVATE CONSTANTS

	//#region PUBLIC PROPERTIES

	/** `true` mientras se cargan los elementos del modelo a los que se pueden anclar las piezas. */
	public IsLoadingModelElements: boolean = false;

	/** `true` mientras está abierto el panel flotante para elegir el tipo de pieza que se añade. */
	public IsPickerOpen: boolean = false;

	/** `true` si el siguiente clic en el modelo coloca una pieza. */
	public IsPlacing: boolean = false;

	/** `true` si el panel de piezas junto al visor está desplegado. Por defecto está plegado, para dar todo el sitio al visor. */
	public IsSidePanelOpen: boolean = false;

	/** Piezas, para su lista. */
	public Items: VisualizationPieceListItem[] = [];

	/** Marcadores de las piezas, listos para pintarlos en el visor. */
	public Markers: BimViewerMarker[] = [];

	/** Elementos del modelo BIM, a los que se pueden anclar las piezas. Vacío mientras no se han pedido. */
	public ModelElements: BimViewerElement[] = [];

	/** Pieza seleccionada, para su panel de detalle. Es `null` si no hay ninguna. */
	public SelectedPiece: VisualizationPiece | null = null;

	/** Identificador (posición en la lista) de la pieza seleccionada, para el visor. Es `null` si no hay ninguna. */
	public SelectedPieceId: number | null = null;

	/** Icono del botón que pliega o despliega el panel de piezas. */
	public SidePanelToggleIcon: string = this._PANEL_COLLAPSED_ICON;

	/** Texto del botón que pliega o despliega el panel de piezas. */
	public SidePanelToggleText: string = this._SHOW_PANEL_TEXT;

	//#endregion PUBLIC PROPERTIES

	//#region PRIVATE PROPERTIES

	/** `true` si los elementos del modelo ya se han pedido con éxito. */
	private _AreModelElementsLoaded: boolean = false;

	/** `true` una vez destruido el componente: ya no se reparten resultados tardíos. */
	private _IsDestroyed: boolean = false;

	/** Identificador del modelo para el que se calcularon los elementos. */
	private _LastModelId: number = ID_NUMERIC_UNDEFINED;

	/** Lista de piezas de la última vez, para saber cuándo se pasa a otra. */
	private _LastPieces: VisualizationPiece[] | null = null;

	/** Avisa al usuario de los fallos. */
	private readonly _Notification: NotificationService;

	/** Tipo de la pieza que se colocará con el siguiente clic en el modelo. Es `null` si no se está colocando ninguna. */
	private _PlacingType: VisualizationPieceType | null = null;

	/** Acceso para operar el visor. Es `null` hasta que el visor está listo. */
	private _ViewerAccess: IBimViewerAccess | null = null;

	//#endregion PRIVATE PROPERTIES

	//#region EMITTERS

	private emitChanged(): void {
		this.changed.emit();
	}

	//#endregion EMITTERS

	//#region CONSTRUCTOR

	/**
	 * @param notification Avisa al usuario de los fallos.
	 */
	constructor(notification: NotificationService) {
		this._Notification = notification;
	}

	//#endregion CONSTRUCTOR

	//#region ANGULAR LIFECYCLE

	public ngOnChanges(): void {
		const modelId: number = CheckUtils.IsNull(this.Model) ? ID_NUMERIC_UNDEFINED : this.Model.Id;

		if (modelId !== this._LastModelId) {
			// Los elementos cargados eran de otro modelo: se vuelven a pedir cuando haga falta
			this._LastModelId = modelId;
			this.ModelElements = [];
			this._AreModelElementsLoaded = false;
		} else {
			// Es el mismo modelo: los elementos cargados siguen valiendo
		}

		if (this.Pieces !== this._LastPieces) {
			// Si no eran piezas aún sin cargar, es otra visualización: se parte de cero, con el panel plegado
			const isNewVisualization: boolean = !CheckUtils.IsNull(this._LastPieces);

			this._LastPieces = this.Pieces;
			this.SelectedPieceId = null;

			if (isNewVisualization) {
				this.setSidePanelOpen(false);
			} else {
				// Son las piezas que acaban de cargarse de la misma visualización: el panel sigue como lo dejó el usuario
			}

			this.setPlacing(null);
		} else {
			// Son las mismas piezas
		}

		if (!this.CanEdit) {
			this.IsPickerOpen = false;
			this.setPlacing(null);
		} else {
			// Al editar se pueden seguir colocando piezas
		}

		this.refreshPieces();
	}

	public ngOnDestroy(): void {
		this._IsDestroyed = true;
		this.changed.complete();
		this._ViewerAccess = null;
	}

	//#endregion ANGULAR LIFECYCLE

	//#region SUBSCRIBERS

	public OnAddPieceClicked(): void {
		// Pulsarlo mientras se está colocando una pieza cancela la colocación
		if (this.IsPlacing) {
			this.setPlacing(null);
		} else {
			this.IsPickerOpen = !this.IsPickerOpen;
		}
	}

	public async OnElementsRequested(): Promise<void> {
		await this.loadModelElements();
	}

	public OnMarkerMoved(event: BimViewerMarkerMovedEvent): void {
		const piece: VisualizationPiece | undefined = this.Pieces?.[event.MarkerId];

		if (this.CanEdit && !CheckUtils.IsUndefined(piece)) {
			piece.Move(event.Hit.Point, event.Hit.ElementId);
			this.markChanged();
		} else {
			// Las piezas ya no se pueden cambiar, o ya no existe la movida
		}
	}

	public OnMarkerSelected(markerId: number): void {
		this.SelectedPieceId = markerId;
		this.refreshPieces();
	}

	public OnPickerClosed(): void {
		this.IsPickerOpen = false;
	}

	public OnPickerTypeChosen(type: VisualizationPieceType): void {
		this.IsPickerOpen = false;
		// Las piezas de este tipo se colocan con un clic en el modelo
		this.setPlacing(type);
	}

	public async OnPieceAnchored(anchorId: number): Promise<void> {
		const piece: VisualizationPiece | null = this.SelectedPiece;

		if (this.CanEdit && !CheckUtils.IsNull(piece) && !CheckUtils.IsNull(this._ViewerAccess)) {
			try {
				// Al anclarla a un elemento del modelo, la pieza se lleva al centro de ese elemento
				const center: BimViewerPoint | null = await this._ViewerAccess.GetElementCenter(anchorId);

				if (!CheckUtils.IsNull(center) && !this._IsDestroyed && piece === this.SelectedPiece) {
					piece.Move(center, anchorId);
					this.markChanged();
				} else {
					// El elemento no tiene geometría (la pieza se queda donde estaba) o ya no es la pieza seleccionada
				}
			} catch (error) {
				this._Notification.Send(this._ANCHOR_ERROR_TEXT, NotificationLevel.DANGER);
				console.warn(`VisualizationPieceWorkspace.OnPieceAnchored() => ${ErrorUtils.GetMessage(error)}`);
			}
		} else {
			// No se puede editar, no hay pieza seleccionada o el visor aún no está listo
		}
	}

	public OnPieceChanged(): void {
		this.markChanged();
	}

	public OnPieceDeleted(): void {
		if (this.CanEdit && !CheckUtils.IsNull(this.Pieces) && !CheckUtils.IsNull(this.SelectedPieceId)) {
			this.Pieces.splice(this.SelectedPieceId, 1);
			this.SelectedPieceId = null;
			this.markChanged();
		} else {
			// No se puede editar o no hay ninguna pieza seleccionada que quitar
		}
	}

	public async OnPieceLocateRequested(): Promise<void> {
		const point: BimViewerPoint | null = CheckUtils.IsNull(this.SelectedPiece) ? null : this.SelectedPiece.GetFocusPoint();

		if (!CheckUtils.IsNull(point) && !CheckUtils.IsNull(this._ViewerAccess)) {
			try {
				await this._ViewerAccess.FocusPoint(point);
			} catch (error) {
				this._Notification.Send(this._LOCATE_ERROR_TEXT, NotificationLevel.DANGER);
				console.warn(`VisualizationPieceWorkspace.OnPieceLocateRequested() => ${ErrorUtils.GetMessage(error)}`);
			}
		} else {
			// No hay pieza seleccionada, no tiene lugar en el modelo o el visor aún no está listo
		}
	}

	public OnPieceSelected(pieceId: number): void {
		this.SelectedPieceId = pieceId;
		this.refreshPieces();
	}

	public OnPointClicked(hit: BimViewerHit): void {
		if (this.IsPlacing && this.CanEdit && !CheckUtils.IsNull(this.Pieces)) {
			const piece: VisualizationPiece | null = this.createPiece(this._PlacingType, hit);

			if (!CheckUtils.IsNull(piece)) {
				this.Pieces.push(piece);
				this.SelectedPieceId = this.Pieces.length - 1;
				this.markChanged();
			} else {
				this._Notification.Send(this._PIECE_CREATE_ERROR_TEXT, NotificationLevel.DANGER);
				console.warn('VisualizationPieceWorkspace.OnPointClicked() => no se ha podido crear la pieza del tipo elegido');
			}

			this.setPlacing(null);
		} else {
			// No se está colocando ninguna pieza: el clic solo mueve el modelo
		}
	}

	public OnPreviewCompiled(event: BimViewerCompiledEvent): void {
		this._ViewerAccess = event.Access;
	}

	public OnSidePanelToggled(): void {
		this.setSidePanelOpen(!this.IsSidePanelOpen);
	}

	//#endregion SUBSCRIBERS

	//#region PRIVATE METHODS

	/**
	 * Crea una pieza nueva del tipo elegido, colocada donde se ha hecho clic en el modelo.
	 * @param type Tipo de la pieza a crear.
	 * @param hit Lo alcanzado en el modelo con el clic.
	 * @returns La pieza, o `null` si no se sabe crear el tipo.
	 */
	private createPiece(type: VisualizationPieceType | null, hit: BimViewerHit): VisualizationPiece | null {
		const info: VisualizationPieceTypeInfo | null = CheckUtils.IsNull(type) ? null : VisualizationPieceTypes.Get(type);
		let result: VisualizationPiece | null = null;

		if (!CheckUtils.IsNull(info)) {
			// El título por defecto es el nombre del tipo con el número que le toca en la lista
			result = info.Create(hit, this.getDefaultName(info.Name, this.Pieces?.length ?? 0));
		} else {
			// No se está colocando ningún tipo
		}

		return result;
	}

	/**
	 * Devuelve el nombre por defecto de una pieza: el nombre de su tipo con el número que le toca en la lista.
	 * @param typeName Nombre del tipo de la pieza.
	 * @param index Posición de la pieza en la lista.
	 */
	private getDefaultName(typeName: string, index: number): string {
		return StringUtils.Format(this._DEFAULT_NAME_TEXT, [typeName, String(index + 1)]);
	}

	/**
	 * Devuelve el nombre con el que se muestra una pieza en la lista.
	 * @param piece Pieza.
	 * @param index Posición de la pieza en la lista.
	 */
	private getPieceName(piece: VisualizationPiece, index: number): string {
		const info: VisualizationPieceTypeInfo | null = VisualizationPieceTypes.Get(piece.Type);
		let result: string = piece.GetLabel();

		if (CheckUtils.IsEmptyString(result)) {
			// Sin nombre propio, el nombre es el del tipo con su número
			result = this.getDefaultName(CheckUtils.IsNull(info) ? piece.Type : info.Name, index);
		} else {
			// La pieza tiene su propio nombre
		}

		return result;
	}

	/** Pide al visor los elementos del modelo, a los que se pueden anclar las piezas. Solo los pide una vez por modelo. */
	private async loadModelElements(): Promise<void> {
		if (!this._AreModelElementsLoaded && !this.IsLoadingModelElements && !CheckUtils.IsNull(this._ViewerAccess)) {
			const modelId: number = this._LastModelId;

			this.IsLoadingModelElements = true;

			try {
				const elements: BimViewerElement[] = await this._ViewerAccess.GetElements();

				// Si mientras tanto se cambió de modelo, los elementos recibidos ya no valen
				if (!this._IsDestroyed && modelId === this._LastModelId) {
					this.ModelElements = elements;
					this._AreModelElementsLoaded = true;
				} else {
					// Los elementos son de otro modelo: se descartan
				}
			} catch (error) {
				this._Notification.Send(this._ELEMENTS_LOAD_ERROR_TEXT, NotificationLevel.DANGER);
				console.warn(`VisualizationPieceWorkspace.loadModelElements() => ${ErrorUtils.GetMessage(error)}`);
			} finally {
				this.IsLoadingModelElements = false;
			}
		} else {
			// Ya están cargados, se están cargando o el visor aún no está listo
		}
	}

	/** Recalcula lo que se muestra de las piezas y avisa de que han cambiado. */
	private markChanged(): void {
		this.refreshPieces();
		this.emitChanged();
	}

	/** Deja calculado lo que la plantilla necesita de las piezas: su lista, la pieza seleccionada y los marcadores del visor. */
	private refreshPieces(): void {
		const pieces: VisualizationPiece[] = CheckUtils.IsNull(this.Pieces) ? [] : this.Pieces;

		this.Items = pieces.map((piece: VisualizationPiece, index: number): VisualizationPieceListItem => {
			const info: VisualizationPieceTypeInfo | null = VisualizationPieceTypes.Get(piece.Type);
			const typeName: string = CheckUtils.IsNull(info) ? piece.Type : info.Name;

			return {
				IconText: typeName,
				IconUrl: CheckUtils.IsNull(info) ? STRING_UNDEFINED : info.IconUrl,
				Id: index,
				IsSelected: index === this.SelectedPieceId,
				Name: this.getPieceName(piece, index),
				TypeName: typeName
			};
		});
		this.SelectedPiece = CheckUtils.IsNull(this.SelectedPieceId) ? null : (pieces[this.SelectedPieceId] ?? null);
		// En el visor solo se pintan las piezas que son marcadores; su identificador es su posición en la lista
		this.Markers = [];
		pieces.forEach((piece: VisualizationPiece, index: number): void => {
			this.Markers.push(...piece.GetViewerMarkers(index));
		});
	}

	/**
	 * Entra o sale del modo colocación: con el siguiente clic en el modelo se crea una pieza del tipo indicado.
	 * @param type Tipo de la pieza a colocar. Con `null`, no se coloca ninguna.
	 */
	private setPlacing(type: VisualizationPieceType | null): void {
		this._PlacingType = type;
		this.IsPlacing = !CheckUtils.IsNull(type);
	}

	/**
	 * Pliega o despliega el panel de piezas junto al visor. Al plegarlo, se cierra el selector de tipos, que cuelga de él.
	 * @param isOpen `true` para desplegarlo.
	 */
	private setSidePanelOpen(isOpen: boolean): void {
		this.IsSidePanelOpen = isOpen;
		this.SidePanelToggleIcon = isOpen ? this._PANEL_EXPANDED_ICON : this._PANEL_COLLAPSED_ICON;
		this.SidePanelToggleText = isOpen ? this._HIDE_PANEL_TEXT : this._SHOW_PANEL_TEXT;

		if (!isOpen) {
			this.IsPickerOpen = false;
		} else {
			// El selector de tipos solo se abre desde el propio panel
		}
	}

	//#endregion PRIVATE METHODS
}
