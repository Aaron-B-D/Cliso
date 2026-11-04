import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { BimViewerCompiledEvent, BimViewerComponent } from 'src/app/shared/components/bimViewer/bimViewer.component';
import { BimViewerLoadingPanelComponent } from 'src/app/shared/components/bimViewerLoadingPanel/bimViewerLoadingPanel.component';
import { BimViewerToolbarComponent } from 'src/app/shared/components/bimViewerToolbar/bimViewerToolbar.component';
import {
	BimViewerLoadingPanelState,
	BimViewerToolbarItem,
	BimViewerToolbarItemId,
	IBimViewerAccess
} from 'src/app/shared/definitions/bimViewer.definitions';
import { ID_NUMERIC_UNDEFINED, STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { IconName } from 'src/app/shared/definitions/icons.definitions';
import { NotificationLevel } from 'src/app/shared/definitions/notifications.definitions';
import { BimModel } from 'src/app/shared/models/bimModel/bimModel.models';
import { BimViewerConfiguration } from 'src/app/shared/models/bimViewer/bimViewerConfiguration.models';
import { BimViewerView } from 'src/app/shared/models/bimViewer/bimViewerView.models';
import { Color } from 'src/app/shared/models/color/color.models';
import { TryGetResult } from 'src/app/shared/models/common/tryGetResult.models';
import { DataAccessService } from 'src/app/shared/services/dataAccess.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { CheckUtils } from 'src/app/shared/utils/check.utils';
import { ErrorUtils } from 'src/app/shared/utils/error.utils';
import { HttpRequestCanceller } from 'src/app/shared/utils/httpRequestCanceller.utils';
import { IconsUtils } from 'src/app/shared/utils/icons.utils';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';
import { RequestUtils } from 'src/app/shared/utils/request.utils';

/** Muestra un modelo BIM: descarga su fichero (con panel de carga) y lo enseña en el visor 3D con su barra de herramientas. */
@Component({
	selector: 'app-bim-viewer-panel',
	imports: [
		BimViewerComponent,
		BimViewerLoadingPanelComponent,
		BimViewerToolbarComponent,
		MatButtonModule,
		MatMenuModule,
		MatSliderModule,
		MatTooltipModule
	],
	templateUrl: './bimViewerPanel.component.html',
	styleUrl: './bimViewerPanel.component.scss'
})
export class BimViewerPanelComponent implements OnChanges, OnDestroy, OnInit {
	//#region DECORATORS

	/** Configuración con la que se muestra el modelo: aspecto y vistas de la cámara. El panel la modifica cuando el usuario la cambia. */
	@Input() public Configuration: BimViewerConfiguration = new BimViewerConfiguration(ID_NUMERIC_UNDEFINED);

	/** Se emite con la configuración cada vez que cambia el aspecto o las vistas de la cámara. */
	@Output() public configurationChanged: EventEmitter<BimViewerConfiguration> = new EventEmitter<BimViewerConfiguration>();

	/** Modelo BIM que se muestra. Mientras no tenga identificador no se descarga nada. */
	@Input() public Model: BimModel = new BimModel(
		ID_NUMERIC_UNDEFINED,
		STRING_UNDEFINED,
		STRING_UNDEFINED,
		STRING_UNDEFINED,
		STRING_UNDEFINED,
		0
	);

	//#endregion DECORATORS

	//#region PUBLIC CONSTANTS

	/** Mayor tamaño de las cuadrículas de la rejilla primaria que se puede elegir. */
	public readonly GRID_PRIMARY_SIZE_MAX: number = 10;

	/** Menor tamaño de las cuadrículas de la rejilla primaria que se puede elegir. */
	public readonly GRID_PRIMARY_SIZE_MIN: number = 0.1;

	/** Salto entre un tamaño de la rejilla primaria y el siguiente. */
	public readonly GRID_PRIMARY_SIZE_STEP: number = 0.1;

	/** Mayor tamaño de las cuadrículas de la rejilla secundaria que se puede elegir. */
	public readonly GRID_SECONDARY_SIZE_MAX: number = 100;

	/** Menor tamaño de las cuadrículas de la rejilla secundaria que se puede elegir. */
	public readonly GRID_SECONDARY_SIZE_MIN: number = 1;

	/** Salto entre un tamaño de la rejilla secundaria y el siguiente. */
	public readonly GRID_SECONDARY_SIZE_STEP: number = 1;

	//#region LANGUAGE TEXTS

	/** Color de fondo del visor. */
	public readonly BACKGROUND_COLOR_TEXT: string = LanguageManager.GetText('BVP_BACKGROUND_COLOR');

	/** Color de la rejilla. */
	public readonly GRID_COLOR_TEXT: string = LanguageManager.GetText('BVP_GRID_COLOR');

	/** Tamaño de las cuadrículas de la rejilla primaria. */
	public readonly GRID_PRIMARY_SIZE_TEXT: string = LanguageManager.GetText('BVP_GRID_SIZE');

	/** Tamaño de las cuadrículas de la rejilla secundaria. */
	public readonly GRID_SECONDARY_SIZE_TEXT: string = LanguageManager.GetText('BVP_GRID_SECONDARY_SIZE');

	/** Color con el que se resalta una pieza. */
	public readonly HIGHLIGHT_COLOR_TEXT: string = LanguageManager.GetText('BVP_HIGHLIGHT_COLOR');

	/** Abrir el menú de estilos. */
	public readonly STYLES_TEXT: string = LanguageManager.GetText('BVP_STYLES');

	//#endregion LANGUAGE TEXTS

	//#endregion PUBLIC CONSTANTS

	//#region PRIVATE CONSTANTS

	/** Aviso de que se ha fijado la vista actual como vista inicial. */
	private readonly _DEFAULT_VIEW_SET_TEXT: string = LanguageManager.GetText('BVP_DEFAULT_VIEW_SET');

	/** Mostrar u ocultar la rejilla. */
	private readonly _GRID_TEXT: string = LanguageManager.GetText('BVP_GRID');

	/** Activar o desactivar el resaltado de piezas al hacer clic. */
	private readonly _HIGHLIGHT_TEXT: string = LanguageManager.GetText('BVP_HIGHLIGHT');

	/** Volver con la cámara a la vista inicial. */
	private readonly _RESET_VIEW_TEXT: string = LanguageManager.GetText('BVP_RESET_VIEW');

	/** Fijar la vista actual como vista inicial. */
	private readonly _SET_DEFAULT_VIEW_TEXT: string = LanguageManager.GetText('BVP_SET_DEFAULT_VIEW');

	//#endregion PRIVATE CONSTANTS

	//#region PUBLIC PROPERTIES

	/** Color de fondo en hexadecimal, tal y como lo pinta el selector de color. */
	public BackgroundColor: string = STRING_UNDEFINED;

	/** Contenido del fichero IFC del modelo. Es `null` mientras no se ha descargado. */
	public Content: Blob | null = null;

	/** Color de la rejilla en hexadecimal, tal y como lo pinta el selector de color. */
	public GridColor: string = STRING_UNDEFINED;

	/** Tamaño de las cuadrículas de la rejilla primaria. */
	public GridPrimarySize: number = 0;

	/** Tamaño de las cuadrículas de la rejilla secundaria. */
	public GridSecondarySize: number = 0;

	/** Color con el que se resalta una pieza en hexadecimal, tal y como lo pinta el selector de color. */
	public HighlightColor: string = STRING_UNDEFINED;

	/** Estado del panel de carga. */
	public LoadingState: BimViewerLoadingPanelState = BimViewerLoadingPanelState.LOADING;

	/** Icono del menú de estilos. */
	public PaletteIcon: string = IconsUtils.GetUrl(IconName.PALETTE);

	/** Porcentaje de la descarga. Es `null` mientras no se conoce el avance. */
	public Progress: number | null = null;

	/** `true` mientras se muestra el panel de carga en lugar del visor. */
	public ShowLoading: boolean = true;

	/** `true` cuando ya se puede mostrar el visor, porque el fichero está descargado. */
	public ShowViewer: boolean = false;

	/** Botones de la barra de herramientas. */
	public ToolbarItems: BimViewerToolbarItem[] = [];

	//#endregion PUBLIC PROPERTIES

	//#region PRIVATE PROPERTIES

	/** Acceso para operar el visor. Es `null` mientras el visor no está listo. */
	private _Access: IBimViewerAccess | null = null;

	/** Corta las peticiones pendientes al cerrar el panel o cancelar la descarga. */
	private readonly _Canceller: HttpRequestCanceller = new HttpRequestCanceller();

	/** Acceso al API. */
	private readonly _DataAccess: DataAccessService;

	/** Número de la última descarga pedida: una descarga anterior no toca el estado de la actual. */
	private _LoadId: number = 0;

	/** Avisa al usuario. */
	private readonly _Notification: NotificationService;

	//#endregion PRIVATE PROPERTIES

	//#region EMITTERS

	private emitConfigurationChanged(): void {
		this.configurationChanged.emit(this.Configuration);
	}

	//#endregion EMITTERS

	//#region CONSTRUCTOR

	/**
	 * @param dataAccess Acceso al API.
	 * @param notification Avisa al usuario.
	 */
	constructor(dataAccess: DataAccessService, notification: NotificationService) {
		this._DataAccess = dataAccess;
		this._Notification = notification;
	}

	//#endregion CONSTRUCTOR

	//#region ANGULAR LIFECYCLE

	public ngOnChanges(changes: SimpleChanges): void {
		if (!CheckUtils.IsUndefined(changes['Model'])) {
			this.loadContent();
		} else {
			// El modelo no ha cambiado
		}
	}

	public ngOnDestroy(): void {
		++this._LoadId;
		this._Access = null;
		this._Canceller.Destroy();
		this.configurationChanged.complete();
	}

	public ngOnInit(): void {
		this.BackgroundColor = this.Configuration.Style.BackgroundColor.HexColor;
		this.GridColor = this.Configuration.Style.GridColor.HexColor;
		this.GridPrimarySize = this.Configuration.Style.GridPrimarySize;
		this.GridSecondarySize = this.Configuration.Style.GridSecondarySize;
		this.HighlightColor = this.Configuration.Style.HighlightColor.HexColor;
		this.refreshToolbar();
	}

	//#endregion ANGULAR LIFECYCLE

	//#region SUBSCRIBERS

	public OnBackgroundColorChanged(color: string): void {
		this.BackgroundColor = color;
		this.applyStyle();
	}

	public OnCancelClicked(): void {
		// La descarga pendiente queda obsoleta y se corta
		++this._LoadId;
		this._Canceller.Cancel();
		this.Progress = null;
		this.LoadingState = BimViewerLoadingPanelState.CANCELED;
	}

	public OnGridColorChanged(color: string): void {
		this.GridColor = color;
		this.applyStyle();
	}

	public OnGridPrimarySizeChanged(size: number): void {
		this.GridPrimarySize = size;
		this.applyStyle();
	}

	public OnGridSecondarySizeChanged(size: number): void {
		this.GridSecondarySize = size;
		this.applyStyle();
	}

	public OnHighlightColorChanged(color: string): void {
		this.HighlightColor = color;
		this.applyStyle();
	}

	/** Evita que un clic dentro del menú de estilos lo cierre: se cierra al hacer clic fuera o con Escape. */
	public OnMenuClicked(event: Event): void {
		event.stopPropagation();
	}

	public OnRetryClicked(): void {
		this.loadContent();
	}

	public OnToolbarItemClicked(id: BimViewerToolbarItemId): void {
		switch (id) {
			case BimViewerToolbarItemId.GRID:
				this.Configuration.Style.GridVisible = !this.Configuration.Style.GridVisible;
				this.applyStyle();
				break;
			case BimViewerToolbarItemId.HIGHLIGHT:
				this.Configuration.Style.HighlightEnabled = !this.Configuration.Style.HighlightEnabled;
				this.applyStyle();
				break;
			case BimViewerToolbarItemId.RESET_VIEW:
				if (CheckUtils.IsNull(this._Access)) {
					// El visor aún no está listo
				} else {
					this._Access.ResetView().catch((error: Error): void => {
						console.warn(
							`BimViewerPanelComponent.OnToolbarItemClicked() => no se ha podido volver a la vista inicial: ${error.message}`
						);
					});
				}
				break;
			case BimViewerToolbarItemId.SET_DEFAULT_VIEW:
				if (CheckUtils.IsNull(this._Access)) {
					// El visor aún no está listo
				} else {
					const view: BimViewerView | null = this._Access.SetCurrentViewAsDefault();

					if (CheckUtils.IsNull(view)) {
						// Aún no hay modelo cargado: no hay vista que fijar
					} else {
						this.Configuration.DefaultView = view;
						this.emitConfigurationChanged();
						this._Notification.Send(this._DEFAULT_VIEW_SET_TEXT, NotificationLevel.SUCCESS);
					}
				}
				break;
			default:
				console.warn('BimViewerPanelComponent.OnToolbarItemClicked() => botón desconocido: ' + String(id));
				break;
		}
	}

	public OnViewChanged(view: BimViewerView): void {
		this.Configuration.CurrentView = view;
		this.emitConfigurationChanged();
	}

	public OnViewerCompiled(event: BimViewerCompiledEvent): void {
		this._Access = event.Access;
		this.applyStyle();
	}

	//#endregion SUBSCRIBERS

	//#region PRIVATE METHODS

	/** Envía al visor el aspecto actual, si ya está listo, y deja al día los botones de la barra. */
	private applyStyle(): void {
		this.Configuration.Style.BackgroundColor = Color.FromHex(this.BackgroundColor);
		this.Configuration.Style.GridColor = Color.FromHex(this.GridColor);
		this.Configuration.Style.GridPrimarySize = this.GridPrimarySize;
		this.Configuration.Style.GridSecondarySize = this.GridSecondarySize;
		this.Configuration.Style.HighlightColor = Color.FromHex(this.HighlightColor);
		this.refreshToolbar();
		this.emitConfigurationChanged();

		if (CheckUtils.IsNull(this._Access)) {
			// El visor aún no está listo: recibirá el aspecto cuando lo esté
		} else {
			this._Access.SetStyle(this.Configuration.Style);
		}
	}

	/** Descarga el fichero IFC del modelo y, al terminar, deja que se muestre el visor. */
	private async loadContent(): Promise<void> {
		const model: BimModel = this.Model;
		const loadId: number = ++this._LoadId;

		this.Content = null;
		this.Progress = null;
		this.LoadingState = BimViewerLoadingPanelState.LOADING;
		this.refreshState();

		if (model.Id === ID_NUMERIC_UNDEFINED) {
			// No hay modelo que descargar
		} else {
			try {
				const result: TryGetResult<Blob> = await RequestUtils.AwaitRequestWithProgress(
					this._DataAccess.BimModels.GetContent(model.Id),
					this._Canceller,
					(percent: number): void => {
						if (loadId === this._LoadId) {
							this.Progress = percent;
						} else {
							// Ya se pidió otra descarga o se canceló esta
						}
					}
				);

				if (result.Success && loadId === this._LoadId) {
					this.Content = result.Result;
					this.refreshState();
				} else {
					// Petición cancelada o superada por otra: no hay nada que hacer
				}
			} catch (error) {
				if (loadId === this._LoadId) {
					this.LoadingState = BimViewerLoadingPanelState.LOAD_ERROR;
				} else {
					// El usuario ya canceló esta descarga: el fallo no le importa
				}

				console.warn(`BimViewerPanelComponent.loadContent() => ${ErrorUtils.GetMessage(error)}`);
			}
		}
	}

	/** Deja calculado qué se muestra: el panel de carga hasta que el fichero está descargado y después el visor. */
	private refreshState(): void {
		this.ShowLoading = CheckUtils.IsNull(this.Content);
		this.ShowViewer = !CheckUtils.IsNull(this.Content);
	}

	/** Construye los botones de la barra con su estado actual. Los de vista esperan a que el visor esté listo; los de aspecto se aplican al estarlo. */
	private refreshToolbar(): void {
		const isViewerNotReady: boolean = CheckUtils.IsNull(this._Access);

		this.ToolbarItems = [
			{
				IconUrl: IconsUtils.GetUrl(IconName.FIT_SCREEN),
				Id: BimViewerToolbarItemId.RESET_VIEW,
				IsActive: null,
				IsDisabled: isViewerNotReady,
				Text: this._RESET_VIEW_TEXT
			},
			{
				IconUrl: IconsUtils.GetUrl(IconName.BOOKMARK),
				Id: BimViewerToolbarItemId.SET_DEFAULT_VIEW,
				IsActive: null,
				IsDisabled: isViewerNotReady,
				Text: this._SET_DEFAULT_VIEW_TEXT
			},
			{
				IconUrl: IconsUtils.GetUrl(IconName.TOUCH_APP),
				Id: BimViewerToolbarItemId.HIGHLIGHT,
				IsActive: this.Configuration.Style.HighlightEnabled,
				IsDisabled: false,
				Text: this._HIGHLIGHT_TEXT
			},
			{
				IconUrl: IconsUtils.GetUrl(IconName.GRID_ON),
				Id: BimViewerToolbarItemId.GRID,
				IsActive: this.Configuration.Style.GridVisible,
				IsDisabled: false,
				Text: this._GRID_TEXT
			}
		];
	}

	//#endregion PRIVATE METHODS
}
