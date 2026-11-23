import {
	AfterViewInit,
	Component,
	ElementRef,
	EventEmitter,
	Input,
	NgZone,
	OnChanges,
	OnDestroy,
	Output,
	SimpleChanges,
	ViewChild
} from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { BIM_VIEWER_MAX_PROGRESS, BimViewerMarkerLinkTarget, IBimViewerAccess } from 'src/app/shared/definitions/bimViewer.definitions';
import { BimViewerElement } from 'src/app/shared/models/bimViewer/bimViewerElement.models';
import { BimViewerHit } from 'src/app/shared/models/bimViewer/bimViewerHit.models';
import { BimViewerPoint } from 'src/app/shared/models/bimViewer/bimViewerPoint.models';
import { BimViewerMarker } from 'src/app/shared/models/bimViewer/bimViewerMarker.models';
import { BimViewerStyle } from 'src/app/shared/models/bimViewer/bimViewerStyle.models';
import { BimViewerView } from 'src/app/shared/models/bimViewer/bimViewerView.models';
import { BimViewerManager } from 'src/app/shared/utils/bimViewer/bimViewerManager.utils';
import { STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { CheckUtils } from 'src/app/shared/utils/check.utils';
import { ErrorUtils } from 'src/app/shared/utils/error.utils';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';
import { StringUtils } from 'src/app/shared/utils/string.utils';

/** El visor 3D está listo: trae el acceso con el que se le puede operar. */
export class BimViewerCompiledEvent {
	//#region PUBLIC PROPERTIES

	/** Acceso para operar el visor. */
	public readonly Access: IBimViewerAccess;

	//#endregion PUBLIC PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param access Acceso para operar el visor.
	 */
	constructor(access: IBimViewerAccess) {
		this.Access = access;
	}

	//#endregion CONSTRUCTOR
}

/** Se ha soltado un marcador tras arrastrarlo: trae su identificador y lo alcanzado en el modelo bajo el puntero. */
export class BimViewerMarkerMovedEvent {
	//#region PUBLIC PROPERTIES

	/** Punto del modelo y elemento donde se ha soltado el marcador. */
	public readonly Hit: BimViewerHit;

	/** Identificador del marcador movido. */
	public readonly MarkerId: number;

	//#endregion PUBLIC PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param markerId Identificador del marcador movido.
	 * @param hit Punto del modelo y elemento donde se ha soltado.
	 */
	constructor(markerId: number, hit: BimViewerHit) {
		this.Hit = hit;
		this.MarkerId = markerId;
	}

	//#endregion CONSTRUCTOR
}

/** Visor 3D de un modelo IFC: lo orbita y acerca, y avisa del punto del modelo en el que se hace clic. */
@Component({
	selector: 'app-bim-viewer',
	imports: [MatProgressBarModule],
	templateUrl: './bimViewer.component.html',
	styleUrl: './bimViewer.component.scss'
})
export class BimViewerComponent implements AfterViewInit, OnChanges, OnDestroy {
	//#region DECORATORS

	/** Elemento donde el motor dibuja el modelo. */
	@ViewChild('container', { static: true }) private _Container!: ElementRef<HTMLDivElement>;

	/** Se emite cuando el motor 3D está listo, con el acceso para operar el visor. */
	@Output() public compiled: EventEmitter<BimViewerCompiledEvent> = new EventEmitter<BimViewerCompiledEvent>();

	/** Modelo IFC que se muestra. Con `null` el visor queda vacío. */
	@Input() public Content: Blob | null = null;

	/** Posición de la cámara en la que se coloca el visor al cargar el modelo. Con `null` se queda en la vista por defecto. */
	@Input() public CurrentView: BimViewerView | null = null;

	/** Vista por defecto con la que arranca el visor al cargar el modelo. Con `null` es la del encuadre automático. */
	@Input() public DefaultView: BimViewerView | null = null;

	/** Porcentaje de la descarga del modelo, de 0 a 100. Con `null` no hay ninguna descarga en curso. */
	@Input() public DownloadProgress: number | null = null;

	/** Se emite al soltar un marcador tras arrastrarlo. */
	@Output() public markerMoved: EventEmitter<BimViewerMarkerMovedEvent> = new EventEmitter<BimViewerMarkerMovedEvent>();

	/** Se emite con el identificador de un marcador al pulsar sobre él. */
	@Output() public markerSelected: EventEmitter<number> = new EventEmitter<number>();

	/** Marcadores que se pintan sobre el modelo. */
	@Input() public Markers: BimViewerMarker[] = [];

	/** `true` si los marcadores se pueden arrastrar. */
	@Input() public MarkersDraggable: boolean = false;

	/** Se emite con lo alcanzado en el modelo (punto del mundo y elemento) al hacer clic sobre él. */
	@Output() public pointClicked: EventEmitter<BimViewerHit> = new EventEmitter<BimViewerHit>();

	/** Identificador del marcador seleccionado, que se pinta destacado. Con `null` no hay ninguno. */
	@Input() public SelectedMarkerId: number | null = null;

	/** Se emite con la vista de la cámara un momento después de que deje de moverse. */
	@Output() public viewChanged: EventEmitter<BimViewerView> = new EventEmitter<BimViewerView>();

	//#endregion DECORATORS

	//#region PUBLIC CONSTANTS

	//#region LANGUAGE TEXTS

	/** Nombre accesible del lienzo del visor. */
	public readonly CANVAS_TEXT: string = LanguageManager.GetText('BV_CANVAS');

	/** Mensaje cuando no hay ningún modelo que mostrar. */
	public readonly EMPTY_TEXT: string = LanguageManager.GetText('BV_EMPTY');

	/** Mensaje cuando el modelo no se ha podido mostrar. */
	public readonly ERROR_TEXT: string = LanguageManager.GetText('BV_ERROR');

	/** Mensaje mientras se procesa el modelo ya descargado. */
	public readonly PROCESSING_TEXT: string = LanguageManager.GetText('BV_PROCESSING');

	//#endregion LANGUAGE TEXTS

	//#endregion PUBLIC CONSTANTS

	//#region PRIVATE CONSTANTS

	/** Milisegundos que la información emergente sigue visible tras dejar el puntero el marcador, para poder llegar hasta ella. */
	private readonly _TOOLTIP_HIDE_DELAY_MS: number = 300;

	/** Ancho máximo, en píxeles, de la información emergente cuando hay sitio de sobra. */
	private readonly _TOOLTIP_MAX_WIDTH_PX: number = 288;

	/** Separación, en píxeles, entre el puntero y la información emergente. */
	private readonly _TOOLTIP_OFFSET_PX: number = 14;

	/** Protocolo `http` tal y como lo devuelve `URL.protocol`. */
	private readonly _PROTOCOL_HTTP: string = 'http:';

	/** Protocolo `https` tal y como lo devuelve `URL.protocol`. */
	private readonly _PROTOCOL_HTTPS: string = 'https:';

	/** Destino con el que un enlace se abre en la pestaña actual. */
	private readonly _TARGET_CURRENT_TAB: string = '_self';

	/** Destino con el que un enlace se abre en una ventana nueva. */
	private readonly _TARGET_NEW_WINDOW: string = '_blank';

	/** Milisegundos sin que se mueva la cámara tras los que se avisa de su vista. */
	private readonly _VIEW_DEBOUNCE_MS: number = 500;

	/** Mensaje mientras se descarga el modelo, con el porcentaje en `{0}`. */
	private readonly _DOWNLOADING_TEXT: string = LanguageManager.GetText('WEB_BIM_MODEL_DOWNLOADING');

	//#endregion PRIVATE CONSTANTS

	//#region PUBLIC PROPERTIES

	/** Porcentaje de la descarga, listo para la barra de progreso. */
	public DownloadPercent: number = 0;

	/** Mensaje de la descarga con su porcentaje. */
	public DownloadText: string = '';

	/** `true` si no hay modelo ni nada en curso y hay que avisarlo. */
	public ShowEmpty: boolean = true;

	/** `true` si el modelo no se ha podido mostrar. */
	public ShowError: boolean = false;

	/** `true` si la información emergente del marcador tiene una descripción que mostrar. */
	public HasTooltipDescription: boolean = false;

	/** `true` si la información emergente del marcador tiene un enlace válido que mostrar. */
	public HasTooltipLink: boolean = false;

	/** `true` si la información emergente de un marcador está visible. */
	public IsTooltipVisible: boolean = false;

	/** Distancia de la información emergente al borde inferior del visor, en píxeles. Es `null` si se coloca desde el borde superior. */
	public TooltipBottom: number | null = null;

	/** Descripción de la información emergente. */
	public TooltipDescription: string = '';

	/** Distancia de la información emergente al borde izquierdo del visor, en píxeles. Es `null` si se coloca desde el borde derecho. */
	public TooltipLeft: number | null = null;

	/** Ancho máximo de la información emergente, en píxeles. */
	public TooltipMaxWidth: number = 0;

	/** Distancia de la información emergente al borde derecho del visor, en píxeles. Es `null` si se coloca desde el borde izquierdo. */
	public TooltipRight: number | null = null;

	/** Dirección del enlace de la información emergente. */
	public TooltipLinkUrl: string = '';

	/** Destino con el que se abre el enlace de la información emergente. */
	public TooltipLinkTarget: string = '_blank';

	/** Título de la información emergente. */
	public TooltipTitle: string = '';

	/** Distancia de la información emergente al borde superior del visor, en píxeles. Es `null` si se coloca desde el borde inferior. */
	public TooltipTop: number | null = null;

	/** `true` mientras se descarga el modelo. */
	public ShowDownload: boolean = false;

	/** `true` mientras se procesa el modelo ya descargado. */
	public ShowProcessing: boolean = false;

	//#endregion PUBLIC PROPERTIES

	//#region PRIVATE PROPERTIES

	/** Acciones con las que se opera el visor desde fuera. */
	private readonly _Access: IBimViewerAccess = {
		FocusPoint: async (point: BimViewerPoint): Promise<void> => {
			this.checkAlive('FocusPoint');
			await this._Manager.FocusPoint(point);
		},
		GetElementCenter: async (elementId: number): Promise<BimViewerPoint | null> => {
			this.checkAlive('GetElementCenter');

			return this._Manager.GetElementCenter(elementId);
		},
		GetElements: async (): Promise<BimViewerElement[]> => {
			this.checkAlive('GetElements');

			return this._Manager.GetElements();
		},
		ResetView: async (): Promise<void> => {
			this.checkAlive('ResetView');
			await this._Manager.ResetView();
		},
		SetCurrentViewAsDefault: (): BimViewerView | null => {
			this.checkAlive('SetCurrentViewAsDefault');

			return this._Manager.SetCurrentViewAsDefault();
		},
		SetStyle: (style: BimViewerStyle): void => {
			this.checkAlive('SetStyle');
			this._Manager.SetStyle(style);
		}
	};

	/** `true` si el modelo no se ha podido cargar. */
	private _HasError: boolean = false;

	/** `true` una vez destruido el visor: el motor ya está liberado y no se puede operar. */
	private _IsDestroyed: boolean = false;

	/** `true` mientras se procesa el modelo ya descargado. */
	private _IsProcessing: boolean = false;

	/** `true` cuando el motor ya está listo para cargar modelos. */
	private _IsReady: boolean = false;

	/** Número de la última carga pedida: una carga anterior no toca el estado de la actual. */
	private _LoadId: number = 0;

	/** Motor 3D. */
	private readonly _Manager: BimViewerManager = new BimViewerManager();

	/** Zona de Angular, para dejar fuera el motor y volver a entrar al avisar de un clic. */
	private readonly _NgZone: NgZone;

	/** Temporizador que oculta la información emergente. Es `null` si no hay ninguno pendiente. */
	private _TooltipTimer: number | null = null;

	/** Temporizador del aviso de la vista de la cámara. Es `null` si no hay ninguno pendiente. */
	private _ViewTimer: number | null = null;

	//#endregion PRIVATE PROPERTIES

	//#region EMITTERS

	private emitCompiled(): void {
		this.compiled.emit(new BimViewerCompiledEvent(this._Access));
	}

	private emitMarkerMoved(markerId: number, hit: BimViewerHit): void {
		this.markerMoved.emit(new BimViewerMarkerMovedEvent(markerId, hit));
	}

	private emitMarkerSelected(markerId: number): void {
		this.markerSelected.emit(markerId);
	}

	private emitPointClicked(hit: BimViewerHit): void {
		this.pointClicked.emit(hit);
	}

	private emitViewChanged(view: BimViewerView): void {
		this.viewChanged.emit(view);
	}

	//#endregion EMITTERS

	//#region CONSTRUCTOR

	constructor(ngZone: NgZone) {
		this._NgZone = ngZone;
	}

	//#endregion CONSTRUCTOR

	//#region ANGULAR LIFECYCLE

	public ngAfterViewInit(): void {
		this.initViewer();
	}

	public ngOnChanges(changes: SimpleChanges): void {
		if (this._IsReady) {
			if (!CheckUtils.IsUndefined(changes['Content'])) {
				this.loadContent();
			} else {
				// El modelo no ha cambiado
			}

			if (!CheckUtils.IsUndefined(changes['Markers'])) {
				this._Manager.SetMarkers(this.Markers);
			} else {
				// Los marcadores no han cambiado
			}

			if (!CheckUtils.IsUndefined(changes['MarkersDraggable'])) {
				this._Manager.SetMarkersDraggable(this.MarkersDraggable);
			} else {
				// No ha cambiado si se pueden arrastrar
			}

			if (!CheckUtils.IsUndefined(changes['SelectedMarkerId'])) {
				this._Manager.SetSelectedMarker(this.SelectedMarkerId);
			} else {
				// No ha cambiado el marcador seleccionado
			}
		} else {
			// El motor aún no está listo: el modelo y el aspecto se aplicarán al terminar de inicializarlo
		}

		this.refreshState();
	}

	public ngOnDestroy(): void {
		this._IsDestroyed = true;
		this.cancelTooltipTimer();
		this.cancelViewTimer();
		this._Manager.OnMarkerHovered = null;
		this._Manager.OnMarkerMoved = null;
		this._Manager.OnMarkerSelected = null;
		this._Manager.OnPointClicked = null;
		this._Manager.OnViewChanged = null;
		this._Manager.Dispose();
		this.compiled.complete();
		this.markerMoved.complete();
		this.markerSelected.complete();
		this.pointClicked.complete();
		this.viewChanged.complete();
	}

	//#endregion ANGULAR LIFECYCLE

	//#region SUBSCRIBERS

	public OnTooltipPointerEnter(): void {
		// El puntero ha llegado a la información emergente: no se oculta
		this.cancelTooltipTimer();
	}

	public OnTooltipPointerLeave(): void {
		this.scheduleTooltipHide();
	}

	//#endregion SUBSCRIBERS

	//#region PRIVATE METHODS

	/** Cancela la ocultación pendiente de la información emergente. */
	private cancelTooltipTimer(): void {
		if (CheckUtils.IsNull(this._TooltipTimer)) {
			// No hay ninguna ocultación pendiente
		} else {
			window.clearTimeout(this._TooltipTimer);
			this._TooltipTimer = null;
		}
	}

	/** Cancela el aviso de la vista de la cámara que esté pendiente. */
	private cancelViewTimer(): void {
		if (CheckUtils.IsNull(this._ViewTimer)) {
			// No hay ningún aviso pendiente
		} else {
			window.clearTimeout(this._ViewTimer);
			this._ViewTimer = null;
		}
	}

	/**
	 * Comprueba que el visor sigue existiendo antes de operarlo desde fuera.
	 * @param action Nombre de la acción que se pide, para el mensaje de error.
	 * @throws Error si el visor ya se ha destruido (quien guardó su acceso lo ha usado tarde).
	 */
	private checkAlive(action: string): void {
		if (this._IsDestroyed) {
			throw new Error(`BimViewer.${action}() => el visor ya se ha destruido`);
		} else {
			// El visor existe: se puede operar
		}
	}

	/** Inicializa el motor 3D y carga el modelo, si ya lo hay. */
	private async initViewer(): Promise<void> {
		try {
			// El motor genera eventos continuos (render, cámara): se deja fuera de la zona para no provocar una detección de cambios por fotograma
			// El aspecto por defecto se aplica hasta que se cambie con `Access.SetStyle`
			await this._NgZone.runOutsideAngular((): Promise<void> =>
				this._Manager.Init(this._Container.nativeElement, new BimViewerStyle())
			);

			// El motor avisa desde fuera de la zona: se vuelve a entrar para que la pantalla se refresque
			this._Manager.OnMarkerHovered = (markerId: number | null, clientX: number, clientY: number): void => {
				this._NgZone.run((): void => this.showTooltip(markerId, clientX, clientY));
			};
			this._Manager.OnMarkerMoved = (markerId: number, hit: BimViewerHit): void => {
				this._NgZone.run((): void => this.emitMarkerMoved(markerId, hit));
			};
			this._Manager.OnMarkerSelected = (markerId: number): void => {
				this._NgZone.run((): void => this.emitMarkerSelected(markerId));
			};
			this._Manager.OnPointClicked = (hit: BimViewerHit): void => {
				this._NgZone.run((): void => this.emitPointClicked(hit));
			};
			this._Manager.OnViewChanged = (view: BimViewerView): void => {
				this.scheduleViewChanged(view);
			};
			this._IsReady = true;
			this._Manager.SetMarkersDraggable(this.MarkersDraggable);
			this._Manager.SetSelectedMarker(this.SelectedMarkerId);
			this._Manager.SetMarkers(this.Markers);
			this.emitCompiled();

			await this.loadContent();
		} catch (error) {
			this._HasError = true;
			console.warn(`BimViewerComponent.initViewer() => ${ErrorUtils.GetMessage(error)}`);
		} finally {
			this.refreshState();
		}
	}

	/** Carga en el motor el modelo actual, o lo vacía si no hay. */
	private async loadContent(): Promise<void> {
		const loadId: number = ++this._LoadId;

		this._HasError = false;

		if (CheckUtils.IsNull(this.Content)) {
			this._IsProcessing = false;
			await this._Manager.Clear();
		} else {
			this._IsProcessing = true;
			this.refreshState();

			try {
				await this._Manager.LoadContent(this.Content, this.DefaultView, this.CurrentView);
			} catch (error) {
				this._HasError = true;
				console.warn(`BimViewerComponent.loadContent() => ${ErrorUtils.GetMessage(error)}`);
			} finally {
				// Si ya se pidió otra carga, el estado es el de esa
				if (loadId === this._LoadId) {
					this._IsProcessing = false;
				} else {
					// Sigue en curso la carga posterior
				}
			}
		}

		this.refreshState();
	}

	/**
	 * Devuelve la dirección de un enlace si es una dirección web (http o https) válida; si no, una cadena vacía.
	 * @param link Enlace escrito por el usuario.
	 */
	private getSafeUrl(link: string): string {
		let result: string = STRING_UNDEFINED;

		if (!CheckUtils.IsEmptyString(link)) {
			try {
				const url: URL = new URL(link);

				if (url.protocol === this._PROTOCOL_HTTP || url.protocol === this._PROTOCOL_HTTPS) {
					result = url.href;
				} else {
					// Otro tipo de enlace (por ejemplo, de script): no se ofrece
				}
			} catch {
				// No es una dirección válida: no se ofrece enlace
			}
		} else {
			// El marcador no tiene enlace
		}

		return result;
	}

	/** Oculta la información emergente pasado un momento, para que dé tiempo a llevar el puntero hasta ella. */
	private scheduleTooltipHide(): void {
		this.cancelTooltipTimer();
		this._TooltipTimer = window.setTimeout((): void => {
			this._TooltipTimer = null;
			this._NgZone.run((): void => {
				this.IsTooltipVisible = false;
			});
		}, this._TOOLTIP_HIDE_DELAY_MS);
	}

	/**
	 * Muestra la información emergente del marcador bajo el puntero, o la oculta cuando ya no hay ninguno.
	 * @param markerId Identificador del marcador bajo el puntero. Con `null`, no hay ninguno.
	 * @param clientX Posición horizontal del puntero en la ventana.
	 * @param clientY Posición vertical del puntero en la ventana.
	 */
	private showTooltip(markerId: number | null, clientX: number, clientY: number): void {
		const marker: BimViewerMarker | undefined = CheckUtils.IsNull(markerId)
			? undefined
			: this.Markers.find((item: BimViewerMarker): boolean => item.Id === markerId);

		if (CheckUtils.IsUndefined(marker)) {
			this.scheduleTooltipHide();
		} else {
			const rect: DOMRect = this._Container.nativeElement.getBoundingClientRect();
			const linkUrl: string = this.getSafeUrl(marker.Link);

			this.cancelTooltipTimer();
			this.TooltipTitle = marker.Text;
			this.TooltipDescription = marker.Description;
			this.TooltipLinkUrl = linkUrl;
			this.TooltipLinkTarget =
				marker.LinkTarget === BimViewerMarkerLinkTarget.CURRENT_TAB ? this._TARGET_CURRENT_TAB : this._TARGET_NEW_WINDOW;
			this.HasTooltipDescription = !CheckUtils.IsEmptyString(marker.Description);
			this.HasTooltipLink = !CheckUtils.IsEmptyString(linkUrl);
			// Se coloca desde el borde más cercano al puntero hacia dentro, para que no se salga del visor
			const x: number = clientX - rect.left;
			const y: number = clientY - rect.top;
			const isRightHalf: boolean = x > rect.width / 2;
			const isBottomHalf: boolean = y > rect.height / 2;

			// El ancho se limita al espacio que queda entre el puntero y el borde hacia el que se extiende
			const availableWidth: number = isRightHalf ? x - this._TOOLTIP_OFFSET_PX : rect.width - x - this._TOOLTIP_OFFSET_PX;

			this.TooltipMaxWidth = Math.max(0, Math.min(this._TOOLTIP_MAX_WIDTH_PX, availableWidth));
			this.TooltipLeft = isRightHalf ? null : x + this._TOOLTIP_OFFSET_PX;
			this.TooltipRight = isRightHalf ? rect.width - x + this._TOOLTIP_OFFSET_PX : null;
			this.TooltipTop = isBottomHalf ? null : y + this._TOOLTIP_OFFSET_PX;
			this.TooltipBottom = isBottomHalf ? rect.height - y + this._TOOLTIP_OFFSET_PX : null;
			// Un marcador sin nada que contar (título, descripción ni enlace) no abre información emergente
			this.IsTooltipVisible = marker.Text !== '' || this.HasTooltipDescription || this.HasTooltipLink;
		}
	}

	/**
	 * Avisa de la vista de la cámara cuando lleva un rato sin moverse: cada movimiento reinicia la espera.
	 * @param view Vista actual de la cámara.
	 */
	private scheduleViewChanged(view: BimViewerView): void {
		this.cancelViewTimer();
		// El temporizador se crea fuera de la zona (el motor ya está fuera) y solo se vuelve a entrar al avisar
		this._ViewTimer = window.setTimeout((): void => {
			this._ViewTimer = null;
			this._NgZone.run((): void => this.emitViewChanged(view));
		}, this._VIEW_DEBOUNCE_MS);
	}

	/** Deja calculado lo que la plantilla necesita para saber qué mostrar. */
	private refreshState(): void {
		this.ShowDownload = !CheckUtils.IsNull(this.DownloadProgress);
		this.ShowProcessing = !this.ShowDownload && this._IsProcessing;
		this.ShowError = !this.ShowDownload && !this.ShowProcessing && this._HasError;
		this.ShowEmpty = !this.ShowDownload && !this.ShowProcessing && !this.ShowError && CheckUtils.IsNull(this.Content);

		if (CheckUtils.IsNull(this.DownloadProgress)) {
			this.DownloadPercent = 0;
		} else {
			this.DownloadPercent = Math.min(BIM_VIEWER_MAX_PROGRESS, Math.max(0, this.DownloadProgress));
		}

		this.DownloadText = StringUtils.Format(this._DOWNLOADING_TEXT, [String(this.DownloadPercent)]);
	}

	//#endregion PRIVATE METHODS
}
