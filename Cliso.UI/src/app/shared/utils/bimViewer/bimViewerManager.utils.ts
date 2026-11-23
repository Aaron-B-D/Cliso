import * as OBC from '@thatopen/components';
import { FragmentsModel, ItemAttribute, ItemData, RaycastResult, RenderedFaces } from '@thatopen/fragments';
import * as THREE from 'three';

import { BimViewerMarkerTitlePosition } from 'src/app/shared/definitions/bimViewer.definitions';
import { BimViewerElement } from 'src/app/shared/models/bimViewer/bimViewerElement.models';
import { BimViewerHit } from 'src/app/shared/models/bimViewer/bimViewerHit.models';
import { BimViewerMarker } from 'src/app/shared/models/bimViewer/bimViewerMarker.models';
import { BimViewerPoint } from 'src/app/shared/models/bimViewer/bimViewerPoint.models';
import { BimViewerStyle } from 'src/app/shared/models/bimViewer/bimViewerStyle.models';
import { BimViewerView } from 'src/app/shared/models/bimViewer/bimViewerView.models';
import { BimViewerMarkerPainter } from 'src/app/shared/utils/bimViewer/bimViewerMarkerPainter.utils';
import { CheckUtils } from 'src/app/shared/utils/check.utils';

/** Arrastre de un marcador en curso. */
type MarkerDragState = {
	HasMoved: boolean;
	Index: number;
	StartX: number;
	StartY: number;
};

/** Motor 3D que representa un modelo IFC: crea la escena y la cámara, carga el modelo y avisa de los clics sobre él. */
export class BimViewerManager {
	//#region PRIVATE CONSTANTS

	/** Desplazamiento máximo (en píxeles) del puntero entre pulsar y soltar para contarlo como clic y no como arrastre. */
	private static readonly _CLICK_MAX_MOVEMENT_PX: number = 4;

	/** Fracción de su opacidad con la que se pinta un marcador atenuado. */
	private static readonly _MARKER_DIM_FACTOR: number = 0.35;

	/** Distancia, en unidades del mundo, que se añade a la caja de un grupo al acercar la cámara a él. */
	private static readonly _MARKER_GROUP_FIT_MARGIN: number = 0.25;

	/** Distancia máxima, en píxeles de pantalla, entre dos marcadores para agruparlos. */
	private static readonly _MARKER_GROUP_DISTANCE_PX: number = 56;

	/** Número mínimo de marcadores que forman un grupo. */
	private static readonly _MARKER_GROUP_MIN_MEMBERS: number = 2;

	/** Tamaño de un grupo en pantalla, como fracción del tamaño de un marcador mediano. */
	private static readonly _MARKER_GROUP_SCALE: number = 0.8;

	/** Radio, en píxeles de la imagen del marcador, dentro del cual una pulsación cuenta como sobre el marcador. */
	private static readonly _MARKER_HIT_RADIUS: number = 56;

	/** Tamaño de un marcador mediano en pantalla, como fracción del alto del visor. Incluye el espacio del título. */
	private static readonly _MARKER_SIZE: number = 0.16;

	/** Carpeta servida como asset donde está `web-ifc.wasm` (evita el CDN externo que ofrece la librería). */
	private static readonly _WASM_PATH: string = new URL('thatopen/', document.baseURI).href;

	/** Fichero servido como asset del worker de Fragments (evita el CDN externo que ofrece la librería). */
	private static readonly _WORKER_URL: string = new URL('thatopen/worker.mjs', document.baseURI).href;

	//#endregion PRIVATE CONSTANTS

	//#region PUBLIC PROPERTIES

	/** Se llama con el identificador de un marcador y el punto del modelo donde se suelta tras arrastrarlo. */
	public OnMarkerMoved: ((markerId: number, hit: BimViewerHit) => void) | null = null;

	/**
	 * Se llama con el identificador del marcador bajo el puntero, o `null` cuando el puntero deja de estar sobre un marcador,
	 * y con la posición del puntero en la ventana.
	 */
	public OnMarkerHovered: ((markerId: number | null, clientX: number, clientY: number) => void) | null = null;

	/** Se llama con el identificador de un marcador cuando se pulsa sobre él. */
	public OnMarkerSelected: ((markerId: number) => void) | null = null;

	/** Se llama con lo alcanzado en el modelo (punto del mundo y elemento) al hacer clic sobre él. No se llama si el clic no cae sobre el modelo. */
	public OnPointClicked: ((hit: BimViewerHit) => void) | null = null;

	/** Se llama con la vista de la cámara cada vez que se mueve, con el modelo ya cargado. Se llama muy seguido: quien escuche debe aligerarlo. */
	public OnViewChanged: ((view: BimViewerView) => void) | null = null;

	//#endregion PUBLIC PROPERTIES

	//#region PRIVATE PROPERTIES

	/** Lienzo WebGL del visor. Es `null` hasta que se crea el renderer. */
	private _Canvas: HTMLCanvasElement | null = null;

	/** Contenedor de componentes de ThatOpen del que cuelga todo el motor 3D. */
	private _Components: OBC.Components = new OBC.Components();

	/** Elemento donde se dibuja el visor. Es `null` hasta llamar a `Init`. */
	private _Container: HTMLDivElement | null = null;

	/** Identificador del modelo cargado y visible. Es `null` si no hay ninguno. */
	private _CurrentModelId: string | null = null;

	/** Vista a la que vuelve la cámara. Es `null` mientras no hay modelo encuadrado. */
	private _DefaultView: BimViewerView | null = null;

	/** `true` cuando el visor ya se ha liberado y no puede volver a usarse. */
	private _Destroyed: boolean = false;

	/** Se cancela al liberar el visor para desbloquear las esperas de eventos que ya no llegarán. */
	private readonly _DisposeController: AbortController = new AbortController();

	/** Búsqueda en curso del punto del modelo bajo el puntero durante un arrastre. Es `null` si no hay ninguna. */
	private _DragPromise: Promise<BimViewerHit | null> | null = null;

	/** Rejilla de la escena. Es `null` hasta que se crea el mundo. */
	private _Grid: OBC.SimpleGrid | null = null;

	/** Marcadores (posiciones en `_Markers`) que forman cada grupo pintado, en el mismo orden que `_GroupSprites`. */
	private _GroupMembers: number[][] = [];

	/** Identifica los grupos pintados: si no cambia, no hay que repintarlos. */
	private _GroupSignature: string = '';

	/** Figuras de la escena con las que se pintan los grupos de marcadores. */
	private _GroupSprites: THREE.Sprite[] = [];

	/** Imagen de los grupos ya creada, por número de marcadores del grupo. */
	private _GroupTextures: Map<number, THREE.CanvasTexture> = new Map<number, THREE.CanvasTexture>();

	/** Cola que serializa las actualizaciones del resaltado: cada una espera a que termine la anterior. */
	private _HighlightQueue: Promise<void> = Promise.resolve();

	/** Identificador, dentro del modelo, del elemento resaltado. Es `null` si no hay ninguno. */
	private _HighlightedLocalId: number | null = null;

	/** Marcador seleccionado cuyo elemento anclado está resaltado con su color. Es `null` si no hay ninguno. */
	private _HighlightMarker: BimViewerMarker | null = null;

	/** Identificador del marcador bajo el puntero. Es `null` si no hay ninguno. */
	private _HoveredMarkerId: number | null = null;

	/** Cola que serializa las cargas: cada una espera a que termine la anterior. */
	private _LoadQueue: Promise<void> = Promise.resolve();

	/** Número de la última carga pedida. Una carga con un número anterior ya no es la vigente y descarta su resultado. */
	private _LoadToken: number = 0;

	/** Arrastre de un marcador en curso. Es `null` si no hay ninguno. */
	private _MarkerDrag: MarkerDragState | null = null;

	/** Figuras de la escena con las que se pintan los marcadores. */
	private _MarkerSprites: THREE.Sprite[] = [];

	/** Marcadores que se pintan sobre el modelo. */
	private _Markers: BimViewerMarker[] = [];

	/** `true` si los marcadores se pueden arrastrar. */
	private _MarkersDraggable: boolean = false;

	/** Cancela el seguimiento de la pulsación en curso. */
	private readonly _OnContainerPointerCancel: () => void = (): void => {
		this._PointerDownPosition = null;
	};

	/** Guarda dónde se pulsó, solo si la pulsación cae sobre el lienzo. */
	private readonly _OnContainerPointerDown: (event: PointerEvent) => void = (event: PointerEvent): void => {
		if (event.target === this._Canvas) {
			this._PointerDownPosition = { x: event.clientX, y: event.clientY };
		} else {
			this._PointerDownPosition = null;
		}
	};

	/** Cuando el puntero sale del visor, ya no hay ningún marcador bajo él. */
	private readonly _OnContainerPointerLeave: () => void = (): void => {
		this.setHoveredMarker(null, 0, 0);
	};

	/** Sigue al puntero para saber qué marcador tiene debajo, si no se está pulsando nada. */
	private readonly _OnContainerPointerMove: (event: PointerEvent) => void = (event: PointerEvent): void => {
		let markerId: number | null = null;

		if (event.target === this._Canvas && event.buttons === 0 && CheckUtils.IsNull(this._MarkerDrag)) {
			const index: number = this.findSpriteAt(this._MarkerSprites, event.clientX, event.clientY);

			markerId = index >= 0 ? this._Markers[index].Id : null;
		} else {
			// El puntero no está libre sobre el lienzo: no hay marcador bajo él
		}

		this.setHoveredMarker(markerId, event.clientX, event.clientY);
	};

	/**
	 * Si se pulsa sobre un marcador, lo selecciona y, si se puede arrastrar, empieza el arrastre; si se pulsa sobre un grupo,
	 * acerca la cámara a él. La pulsación no llega a la cámara.
	 */
	private readonly _OnContainerPointerDownCapture: (event: PointerEvent) => void = (event: PointerEvent): void => {
		if (event.target === this._Canvas && event.button === 0) {
			const index: number = this.findSpriteAt(this._MarkerSprites, event.clientX, event.clientY);
			const groupIndex: number = index >= 0 ? -1 : this.findSpriteAt(this._GroupSprites, event.clientX, event.clientY);

			if (groupIndex >= 0) {
				event.stopPropagation();
				this._PointerDownPosition = null;
				this.focusGroup(groupIndex);
			} else if (index >= 0) {
				event.stopPropagation();
				this._PointerDownPosition = null;
				this.setHighlightMarker(this._Markers[index]);
				this.OnMarkerSelected?.(this._Markers[index].Id);

				if (this._MarkersDraggable) {
					this._MarkerDrag = { HasMoved: false, Index: index, StartX: event.clientX, StartY: event.clientY };
					window.addEventListener('pointercancel', this._OnWindowPointerCancel);
					window.addEventListener('pointermove', this._OnWindowPointerMove);
					window.addEventListener('pointerup', this._OnWindowPointerUp);
				} else {
					// Los marcadores no se pueden arrastrar: la pulsación solo los selecciona
				}
			} else {
				// No hay ningún marcador bajo el puntero: sigue el curso normal (cámara y clic)
			}
		} else {
			// No es una pulsación con el botón principal sobre el lienzo
		}
	};

	/** Si el puntero casi no se ha movido desde que se pulsó, es un clic y se busca el punto del modelo bajo él. */
	private readonly _OnContainerPointerUp: (event: PointerEvent) => void = (event: PointerEvent): void => {
		const downPosition: { x: number; y: number } | null = this._PointerDownPosition;

		this._PointerDownPosition = null;

		if (!CheckUtils.IsNull(downPosition) && event.target === this._Canvas && event.button === 0) {
			const movement: number = Math.hypot(event.clientX - downPosition.x, event.clientY - downPosition.y);

			if (movement <= BimViewerManager._CLICK_MAX_MOVEMENT_PX) {
				this.notifyPointClicked(event.clientX, event.clientY).catch((error: Error): void => {
					console.warn(`BimViewerManager.notifyPointClicked() => no se ha podido resolver el clic: ${error.message}`);
				});
			} else {
				// Es un arrastre de cámara, no un clic
			}
		} else {
			// No es un clic con el botón principal sobre el lienzo
		}
	};

	/** Cancela el arrastre del marcador y lo devuelve a su sitio. */
	private readonly _OnWindowPointerCancel: () => void = (): void => {
		this.endMarkerDrag();
		this.applyMarkers();
	};

	/** Mientras se arrastra un marcador, lo lleva al punto del modelo bajo el puntero. */
	private readonly _OnWindowPointerMove: (event: PointerEvent) => void = (event: PointerEvent): void => {
		const drag: MarkerDragState | null = this._MarkerDrag;

		if (!CheckUtils.IsNull(drag)) {
			if (!drag.HasMoved && Math.hypot(event.clientX - drag.StartX, event.clientY - drag.StartY) > BimViewerManager._CLICK_MAX_MOVEMENT_PX) {
				drag.HasMoved = true;
			} else {
				// Aún no se ha movido lo bastante para contarlo como arrastre, o ya está arrastrándose
			}

			// Con una búsqueda en curso no se lanza otra: la siguiente llegará con el siguiente movimiento
			if (drag.HasMoved && CheckUtils.IsNull(this._DragPromise)) {
				this._DragPromise = this.moveDraggedMarker(drag.Index, event.clientX, event.clientY);
				this._DragPromise
					.catch((error: Error): void => {
						console.warn(`BimViewerManager.moveDraggedMarker() => no se ha podido mover el marcador: ${error.message}`);
					})
					.finally((): void => {
						this._DragPromise = null;
					});
			} else {
				// No se ha movido o ya hay una búsqueda en curso
			}
		} else {
			// No hay ningún arrastre en curso
		}
	};

	/** Al soltar un marcador arrastrado, lo deja en el punto del modelo bajo el puntero y avisa. */
	private readonly _OnWindowPointerUp: (event: PointerEvent) => void = (event: PointerEvent): void => {
		const drag: MarkerDragState | null = this._MarkerDrag;

		this.endMarkerDrag();

		if (!CheckUtils.IsNull(drag) && drag.HasMoved) {
			this.dropMarker(drag.Index, event.clientX, event.clientY).catch((error: Error): void => {
				console.warn(`BimViewerManager.dropMarker() => no se ha podido soltar el marcador: ${error.message}`);
			});
		} else {
			// Fue una pulsación sin arrastre: el marcador ya quedó seleccionado
		}
	};

	/** Posición en la que se pulsó el puntero. Es `null` si no hay una pulsación en curso. */
	private _PointerDownPosition: { x: number; y: number } | null = null;

	/** Resultado de `Init`. Es `null` hasta que se llama a `Init`. */
	private _Ready: Promise<void> | null = null;

	/** Identificador del marcador seleccionado. Es `null` si no hay ninguno. */
	private _SelectedMarkerId: number | null = null;

	/** Aspecto del visor. Es `null` hasta que se recibe con `Init`. */
	private _Style: BimViewerStyle | null = null;

	/** Mundo 3D (escena, cámara y renderer). Es `null` hasta que se crea. */
	private _World: OBC.SimpleWorld<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBC.SimpleRenderer> | null = null;

	//#endregion PRIVATE PROPERTIES

	//#region PUBLIC METHODS

	/** Quita el modelo cargado, si lo hay, y descarta las cargas que estén en curso. */
	public async Clear(): Promise<void> {
		if (this._Destroyed) {
			// El visor ya no existe: no hay nada que quitar
		} else {
			// Cualquier carga pedida antes queda obsoleta y descarta su resultado
			++this._LoadToken;
			this._LoadQueue = this._LoadQueue.then((): Promise<void> => this.disposeCurrentModel()).catch((): void => undefined);

			await this._LoadQueue;
		}
	}

	/** Libera el motor 3D. El visor no puede volver a usarse después. */
	public Dispose(): void {
		this._Destroyed = true;
		this.endMarkerDrag();
		this.clearMarkers();

		for (const texture of this._GroupTextures.values()) {
			texture.dispose();
		}

		this._GroupTextures.clear();
		this._DisposeController.abort();
		this._Container?.removeEventListener('pointercancel', this._OnContainerPointerCancel);
		this._Container?.removeEventListener('pointerdown', this._OnContainerPointerDown);
		this._Container?.removeEventListener('pointerdown', this._OnContainerPointerDownCapture, true);
		this._Container?.removeEventListener('pointerleave', this._OnContainerPointerLeave);
		this._Container?.removeEventListener('pointermove', this._OnContainerPointerMove);
		this._Container?.removeEventListener('pointerup', this._OnContainerPointerUp);
		this._Components.dispose();
	}

	/**
	 * Lleva la vista a un punto del modelo: la cámara se centra en él con una transición, sin cambiar desde dónde mira ni a qué
	 * distancia.
	 * @param point Punto en coordenadas del mundo.
	 */
	public async FocusPoint(point: BimViewerPoint): Promise<void> {
		if (this._Destroyed || CheckUtils.IsNull(this._World)) {
			// El visor ya no existe o aún no hay escena a la que mover la cámara
		} else {
			await this._World.camera.controls.moveTo(point.X, point.Y, point.Z, true);
		}
	}

	/**
	 * Calcula el centro de un elemento del modelo cargado.
	 * @param elementId Identificador local del elemento dentro del modelo.
	 * @returns El centro del elemento en coordenadas del mundo, o `null` si no hay modelo cargado o el elemento no tiene geometría.
	 */
	public async GetElementCenter(elementId: number): Promise<BimViewerPoint | null> {
		let result: BimViewerPoint | null = null;
		const model: FragmentsModel | undefined = CheckUtils.IsNull(this._CurrentModelId)
			? undefined
			: this._Components.get(OBC.FragmentsManager).list.get(this._CurrentModelId);

		if (CheckUtils.IsUndefined(model)) {
			// No hay modelo cargado: no hay elemento del que calcular el centro
		} else {
			const box: THREE.Box3 = await model.getMergedBox([elementId]);

			if (box.isEmpty()) {
				// El elemento no tiene geometría
			} else {
				// La caja está en el espacio del modelo: se lleva al del mundo, donde están los marcadores
				const center: THREE.Vector3 = box.getCenter(new THREE.Vector3()).applyMatrix4(model.object.matrixWorld);

				result = new BimViewerPoint(center.x, center.y, center.z);
			}
		}

		return result;
	}

	/**
	 * Lista los elementos con geometría del modelo cargado.
	 * @returns Los elementos, con su identificador, nombre y categoría. Vacío si no hay modelo cargado.
	 */
	public async GetElements(): Promise<BimViewerElement[]> {
		const result: BimViewerElement[] = [];
		const model: FragmentsModel | undefined = CheckUtils.IsNull(this._CurrentModelId)
			? undefined
			: this._Components.get(OBC.FragmentsManager).list.get(this._CurrentModelId);

		if (CheckUtils.IsUndefined(model)) {
			// No hay modelo cargado: no hay elementos que listar
		} else {
			const ids: number[] = await model.getItemsIdsWithGeometry();
			const data: ItemData[] = await model.getItemsData(ids, {
				attributesDefault: true,
				relationsDefault: { attributes: false, relations: false }
			});

			data.forEach((item: ItemData, index: number): void => {
				result.push(
					new BimViewerElement(
						ids[index],
						BimViewerManager.readTextAttribute(item, 'Name'),
						BimViewerManager.readTextAttribute(item, '_category')
					)
				);
			});
		}

		return result;
	}

	/**
	 * Crea la escena, la cámara y el renderer sobre el contenedor. Solo hace algo la primera vez.
	 * @param container Elemento donde se dibuja el visor.
	 * @param style Aspecto inicial del visor.
	 * @returns Promesa que se cumple cuando el motor está listo.
	 */
	public Init(container: HTMLDivElement, style: BimViewerStyle): Promise<void> {
		let result: Promise<void> = Promise.resolve();

		if (this._Destroyed) {
			console.warn('BimViewerManager.Init() => el visor ya se ha liberado');
		} else if (CheckUtils.IsNull(this._Ready)) {
			this._Container = container;
			this._Style = style;
			this._Ready = this.initWorld(container);
			result = this._Ready;
		} else {
			result = this._Ready;
		}

		return result;
	}

	/**
	 * Carga un modelo IFC y lo encuadra, sustituyendo el anterior. Si llega otra carga mientras una está en curso, la anterior
	 * descarta su resultado.
	 * @param content Contenido del fichero IFC.
	 * @param defaultView Vista por defecto con la que se arranca. Con `null` es la del encuadre del modelo.
	 * @param currentView Vista en la que se coloca la cámara al terminar de cargar. Con `null` se queda en la vista por defecto.
	 */
	public async LoadContent(content: Blob, defaultView: BimViewerView | null, currentView: BimViewerView | null): Promise<void> {
		if (this._Destroyed) {
			// El visor ya no existe: no hay nada que cargar
		} else {
			const loadToken: number = ++this._LoadToken;
			const currentLoad: Promise<void> = this._LoadQueue.then((): Promise<void> =>
				this.loadContent(content, defaultView, currentView, loadToken)
			);

			// Si esta carga falla, el error le llega a quien la pidió y la cola sigue para la siguiente
			this._LoadQueue = currentLoad.catch((): void => undefined);

			await currentLoad;
		}
	}

	/** Devuelve la cámara a la vista por defecto: la del encuadre inicial del modelo o la que se fijó con `SetCurrentViewAsDefault`. */
	public async ResetView(): Promise<void> {
		if (CheckUtils.IsNull(this._World) || CheckUtils.IsNull(this._DefaultView)) {
			// No hay modelo encuadrado al que volver
		} else {
			const view: BimViewerView = this._DefaultView;

			await this._World.camera.controls.setLookAt(
				view.Position.X,
				view.Position.Y,
				view.Position.Z,
				view.Target.X,
				view.Target.Y,
				view.Target.Z,
				true
			);
		}
	}

	/**
	 * Fija la vista actual de la cámara como la vista por defecto.
	 * @returns La vista fijada, o `null` si no hay modelo cargado.
	 */
	public SetCurrentViewAsDefault(): BimViewerView | null {
		this._DefaultView = this.readCurrentView();

		return this._DefaultView;
	}

	/**
	 * Cambia los marcadores que se pintan sobre el modelo: sustituye a los anteriores.
	 * @param markers Marcadores a pintar.
	 */
	public SetMarkers(markers: BimViewerMarker[]): void {
		this._Markers = markers;
		this.applyMarkers();
		this.syncSelectedHighlight();
	}

	/**
	 * Indica si los marcadores se pueden arrastrar con el puntero.
	 * @param draggable `true` para poder arrastrarlos.
	 */
	public SetMarkersDraggable(draggable: boolean): void {
		this._MarkersDraggable = draggable;
	}

	/**
	 * Marca como seleccionado un marcador, que se pinta destacado.
	 * @param markerId Identificador del marcador. Con `null`, no hay ninguno seleccionado.
	 */
	public SetSelectedMarker(markerId: number | null): void {
		this._SelectedMarkerId = markerId;
		this.applyMarkers();
		this.syncSelectedHighlight();
	}

	/**
	 * Cambia el aspecto del visor, también con un modelo ya cargado.
	 * @param style Nuevo aspecto.
	 */
	public SetStyle(style: BimViewerStyle): void {
		this._Style = style;
		this.applyStyle();
	}

	//#endregion PUBLIC METHODS

	//#region PRIVATE METHODS

	/** Deja resaltado, con el color del aspecto, el elemento elegido; si el resaltado está desactivado o no hay elemento, lo quita. */
	private async applyHighlight(): Promise<void> {
		const modelId: string | null = this._CurrentModelId;

		if (!this._Destroyed && !CheckUtils.IsNull(modelId) && !CheckUtils.IsNull(this._Style)) {
			const fragments: OBC.FragmentsManager = this._Components.get(OBC.FragmentsManager);
			const model: FragmentsModel | undefined = fragments.list.get(modelId);

			if (CheckUtils.IsUndefined(model)) {
				// El modelo ya no está cargado
			} else {
				await model.resetHighlight();

				const markerToHighlight: BimViewerMarker | null = this._HighlightMarker;

				if (!CheckUtils.IsNull(markerToHighlight) && !CheckUtils.IsNull(markerToHighlight.AnchorId)) {
					// El elemento anclado al marcador seleccionado se resalta con el color del marcador
					await model.highlight([markerToHighlight.AnchorId], {
						color: new THREE.Color(markerToHighlight.Color.RgbColor),
						opacity: 1,
						renderedFaces: RenderedFaces.TWO,
						transparent: false
					});
				} else if (this._Style.HighlightEnabled && !CheckUtils.IsNull(this._HighlightedLocalId)) {
					await model.highlight([this._HighlightedLocalId], {
						color: new THREE.Color(this._Style.HighlightColor.RgbColor),
						opacity: 1,
						renderedFaces: RenderedFaces.TWO,
						transparent: false
					});
				} else {
					// Nada que resaltar
				}

				await fragments.core.update(true);
			}
		} else {
			// No hay modelo o aspecto sobre los que actuar
		}
	}

	/** Pinta en la escena los marcadores actuales, sustituyendo a los que hubiera. Si aún no hay escena, se pintarán al crearla. */
	private applyMarkers(): void {
		if (this._Destroyed || CheckUtils.IsNull(this._World)) {
			// Aún no hay escena (o ya no existe): se pintarán al crearla
		} else {
			this.clearMarkers();

			for (const marker of this._Markers) {
				const sprite: THREE.Sprite = this.createMarkerSprite(marker);

				this._World.scene.three.add(sprite);
				this._MarkerSprites.push(sprite);
			}

			this.updateMarkerGroups();
		}
	}

	/** Aplica el aspecto a la escena y a la rejilla. Si aún no existen, se aplicará al crearlos. */
	private applyStyle(): void {
		if (CheckUtils.IsNull(this._World) || CheckUtils.IsNull(this._Grid) || CheckUtils.IsNull(this._Style)) {
			// Aún no hay escena: se aplicará al crearla
		} else {
			this._World.scene.config.backgroundColor = new THREE.Color(this._Style.BackgroundColor.RgbColor);
			this._Grid.config.color = new THREE.Color(this._Style.GridColor.RgbColor);
			this._Grid.config.primarySize = this._Style.GridPrimarySize;
			this._Grid.config.secondarySize = this._Style.GridSecondarySize;
			this._Grid.config.visible = this._Style.GridVisible;

			// Al activar, desactivar o recolorear el resaltado, el elemento resaltado se actualiza
			this.refreshHighlight().catch((error: Error): void => {
				console.warn(`BimViewerManager.refreshHighlight() => no se ha podido actualizar el resaltado: ${error.message}`);
			});
		}
	}

	/** Espera a que termine `Init`. Lanza un error si no se ha llamado o si falló. */
	private async awaitReady(): Promise<void> {
		if (CheckUtils.IsNull(this._Ready)) {
			throw new Error('BimViewerManager.awaitReady() => el visor no se ha inicializado');
		} else {
			await this._Ready;
		}
	}

	/** Quita de la escena las figuras de los marcadores y libera su imagen. */
	private clearMarkers(): void {
		for (const sprite of this._MarkerSprites) {
			this._World?.scene.three.remove(sprite);
			sprite.material.map?.dispose();
			sprite.material.dispose();
		}

		this._MarkerSprites = [];
		this.clearGroups();
		this._GroupSignature = '';
	}

	/** Quita de la escena las figuras de los grupos. Su imagen se conserva para reutilizarla. */
	private clearGroups(): void {
		for (const sprite of this._GroupSprites) {
			this._World?.scene.three.remove(sprite);
			sprite.material.dispose();
		}

		this._GroupSprites = [];
		this._GroupMembers = [];
	}

	/**
	 * Crea la figura con la que se pinta un marcador: un círculo de su color con su icono y, debajo, su título. Siempre mira a la
	 * cámara y se ve aunque haya elementos delante.
	 * @param marker Marcador a pintar.
	 */
	private createMarkerSprite(marker: BimViewerMarker): THREE.Sprite {
		// Con el título a la derecha la imagen es el doble de ancha, con el círculo en su mitad izquierda
		const isTitleRight: boolean = marker.TitlePosition === BimViewerMarkerTitlePosition.RIGHT;
		const canvas: HTMLCanvasElement = BimViewerMarkerPainter.CreateMarkerCanvas(marker, marker.Id === this._SelectedMarkerId);
		const material: THREE.SpriteMaterial = new THREE.SpriteMaterial({
			// Si el marcador no se ve a través del modelo, los elementos que haya delante lo tapan
			depthTest: !marker.VisibleThroughModel,
			map: new THREE.CanvasTexture(canvas),
			opacity: this.getMarkerOpacity(marker),
			sizeAttenuation: false,
			transparent: true
		});
		const sprite: THREE.Sprite = new THREE.Sprite(material);
		const scale: number = BimViewerManager._MARKER_SIZE * marker.Size;

		sprite.position.set(marker.Position.X, marker.Position.Y, marker.Position.Z);

		if (isTitleRight) {
			// La figura es el doble de ancha y se ancla en el centro del círculo, para que este quede en la posición del marcador
			sprite.scale.set(scale * BimViewerMarkerPainter.TITLE_RIGHT_WIDTH_FACTOR, scale, 1);
			sprite.center.set(0.5 / BimViewerMarkerPainter.TITLE_RIGHT_WIDTH_FACTOR, 0.5);
		} else {
			sprite.scale.set(scale, scale, 1);
		}
		// Se pinta la última, por encima del modelo
		sprite.renderOrder = 1;

		return sprite;
	}

	/**
	 * Termina el arrastre de un marcador, si lo hay, y deja de escuchar al puntero fuera del visor.
	 */
	private endMarkerDrag(): void {
		this._MarkerDrag = null;
		window.removeEventListener('pointercancel', this._OnWindowPointerCancel);
		window.removeEventListener('pointermove', this._OnWindowPointerMove);
		window.removeEventListener('pointerup', this._OnWindowPointerUp);
	}

	/**
	 * Suelta un marcador arrastrado en el punto del modelo bajo el puntero y avisa. Si el puntero no está sobre el modelo, el
	 * marcador vuelve a su sitio.
	 * @param index Posición del marcador en la lista de marcadores.
	 * @param clientX Posición horizontal del puntero en la ventana.
	 * @param clientY Posición vertical del puntero en la ventana.
	 */
	private async dropMarker(index: number, clientX: number, clientY: number): Promise<void> {
		// Se espera a la búsqueda del último movimiento para que no llegue después y pise la de aquí
		await this._DragPromise?.catch((): null => null);

		const hit: BimViewerHit | null = await this.moveDraggedMarker(index, clientX, clientY);

		if (this._Destroyed) {
			// El visor se liberó mientras se resolvía la suelta
		} else if (CheckUtils.IsNull(hit)) {
			this.applyMarkers();
		} else {
			this.OnMarkerMoved?.(this._Markers[index].Id, hit);
		}
	}

	/**
	 * Busca la posición, en una lista de figuras de marcadores o de grupos, de la que está bajo el puntero. Solo cuenta el círculo
	 * del icono, no el espacio del título, y se ignoran las figuras ocultas.
	 * @param sprites Figuras entre las que buscar.
	 * @param clientX Posición horizontal del puntero en la ventana.
	 * @param clientY Posición vertical del puntero en la ventana.
	 * @returns La posición de la figura en la lista, o -1 si no hay ninguna bajo el puntero.
	 */
	private findSpriteAt(sprites: THREE.Sprite[], clientX: number, clientY: number): number {
		let result: number = -1;

		if (!CheckUtils.IsNull(this._World) && !CheckUtils.IsNull(this._Canvas) && sprites.length > 0) {
			const rect: DOMRect = this._Canvas.getBoundingClientRect();
			const pointer: THREE.Vector2 = new THREE.Vector2(
				((clientX - rect.left) / rect.width) * 2 - 1,
				-((clientY - rect.top) / rect.height) * 2 + 1
			);
			const raycaster: THREE.Raycaster = new THREE.Raycaster();
			const maxDistance: number = BimViewerManager._MARKER_HIT_RADIUS / BimViewerMarkerPainter.TEXTURE_SIZE;

			raycaster.setFromCamera(pointer, this._World.camera.three);

			for (const intersection of raycaster.intersectObjects(sprites)) {
				const sprite: THREE.Sprite = intersection.object as THREE.Sprite;

				if (result < 0 && sprite.visible && !CheckUtils.IsUndefined(intersection.uv)) {
					// El círculo está en el punto de anclaje de la figura; con la figura más ancha que alta, la distancia horizontal se escala
					const dx: number = (intersection.uv.x - sprite.center.x) * (sprite.scale.x / sprite.scale.y);
					const dy: number = intersection.uv.y - sprite.center.y;

					if (Math.hypot(dx, dy) <= maxDistance) {
						result = sprites.indexOf(sprite);
					} else {
						// El puntero cae fuera del círculo
					}
				} else {
					// Ya se encontró una, o esta figura está oculta
				}
			}
		} else {
			// No hay escena, o no hay marcadores
		}

		return result;
	}

	/**
	 * Lleva la figura de un marcador al punto del modelo bajo el puntero, sin tocar el marcador en sí.
	 * @param index Posición del marcador en la lista de marcadores.
	 * @param clientX Posición horizontal del puntero en la ventana.
	 * @param clientY Posición vertical del puntero en la ventana.
	 * @returns Lo alcanzado bajo el puntero, o `null` si no cae sobre el modelo.
	 */
	private async moveDraggedMarker(index: number, clientX: number, clientY: number): Promise<BimViewerHit | null> {
		const hit: BimViewerHit | null = await this.raycastModel(clientX, clientY);
		const sprite: THREE.Sprite | undefined = this._MarkerSprites[index];

		if (!CheckUtils.IsNull(hit) && !CheckUtils.IsUndefined(sprite)) {
			sprite.position.set(hit.Point.X, hit.Point.Y, hit.Point.Z);
		} else {
			// El puntero no está sobre el modelo, o los marcadores se repintaron mientras tanto
		}

		return hit;
	}

	/**
	 * Busca lo que hay del modelo bajo el puntero.
	 * @param clientX Posición horizontal del puntero en la ventana.
	 * @param clientY Posición vertical del puntero en la ventana.
	 * @returns El punto del mundo y el elemento alcanzados, o `null` si no hay modelo o el puntero no cae sobre él.
	 */
	private async raycastModel(clientX: number, clientY: number): Promise<BimViewerHit | null> {
		let result: BimViewerHit | null = null;

		if (CheckUtils.IsNull(this._World) || CheckUtils.IsNull(this._Canvas) || CheckUtils.IsNull(this._CurrentModelId)) {
			// No hay modelo cargado sobre el que buscar
		} else {
			const model: FragmentsModel | undefined = this._Components.get(OBC.FragmentsManager).list.get(this._CurrentModelId);

			if (CheckUtils.IsUndefined(model)) {
				console.warn('BimViewerManager.raycastModel() => el modelo ya no está cargado');
			} else {
				const hit: RaycastResult | null = await model.raycast({
					camera: this._World.camera.three,
					mouse: new THREE.Vector2(clientX, clientY),
					dom: this._Canvas
				});

				if (!CheckUtils.IsNull(hit)) {
					result = new BimViewerHit(new BimViewerPoint(hit.point.x, hit.point.y, hit.point.z), hit.localId);
				} else {
					// El puntero no cae sobre el modelo
				}
			}
		}

		return result;
	}

	/**
	 * Pinta los grupos indicados: oculta las figuras de sus marcadores y pone en el centro de cada grupo una figura con el número
	 * de marcadores que lo forman.
	 * @param groups Marcadores de cada grupo, como posiciones en la lista de marcadores.
	 */
	private applyMarkerGroups(groups: number[][]): void {
		const world: OBC.SimpleWorld<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBC.SimpleRenderer> | null = this._World;

		this.clearGroups();

		for (const sprite of this._MarkerSprites) {
			sprite.visible = true;
		}

		if (CheckUtils.IsNull(world)) {
			// Aún no hay escena donde pintar los grupos
		} else {
			for (const members of groups) {
				const center: THREE.Vector3 = new THREE.Vector3();

				for (const index of members) {
					const position: BimViewerPoint = this._Markers[index].Position;

					this._MarkerSprites[index].visible = false;
					center.add(new THREE.Vector3(position.X, position.Y, position.Z));
				}

				center.divideScalar(members.length);

				const groupSprite: THREE.Sprite = this.createGroupSprite(members.length, center);

				world.scene.three.add(groupSprite);
				this._GroupSprites.push(groupSprite);
				this._GroupMembers.push(members);
			}
		}
	}

	/**
	 * Calcula qué marcadores se agrupan: los que, vistos desde la cámara, quedan a menos de cierta distancia en pantalla. El
	 * marcador seleccionado y el que se arrastra no se agrupan.
	 * @returns Los grupos de dos o más marcadores, como posiciones en la lista de marcadores.
	 */
	private computeMarkerGroups(): number[][] {
		const result: number[][] = [];

		if (!CheckUtils.IsNull(this._World) && !CheckUtils.IsNull(this._Canvas)) {
			const rect: DOMRect = this._Canvas.getBoundingClientRect();
			const camera: THREE.Camera = this._World.camera.three;
			const screenPoints: (THREE.Vector2 | null)[] = [];
			const isAssigned: boolean[] = [];
			const maxDistance: number = BimViewerManager._MARKER_GROUP_DISTANCE_PX;

			for (let index: number = 0; index < this._Markers.length; ++index) {
				const marker: BimViewerMarker = this._Markers[index];
				const isFixed: boolean = marker.Id === this._SelectedMarkerId || this._MarkerDrag?.Index === index;
				const projected: THREE.Vector3 = new THREE.Vector3(marker.Position.X, marker.Position.Y, marker.Position.Z).project(camera);
				const isInFront: boolean = projected.z >= -1 && projected.z <= 1;

				// Lo que no se ve (detrás de la cámara) o no debe agruparse queda fuera
				screenPoints.push(
					isInFront && !isFixed
						? new THREE.Vector2((projected.x * 0.5 + 0.5) * rect.width, (-projected.y * 0.5 + 0.5) * rect.height)
						: null
				);
				isAssigned.push(false);
			}

			for (let index: number = 0; index < screenPoints.length; ++index) {
				const seed: THREE.Vector2 | null = screenPoints[index];

				if (!isAssigned[index] && !CheckUtils.IsNull(seed)) {
					const members: number[] = [index];

					isAssigned[index] = true;

					for (let other: number = index + 1; other < screenPoints.length; ++other) {
						const point: THREE.Vector2 | null = screenPoints[other];

						if (!isAssigned[other] && !CheckUtils.IsNull(point) && seed.distanceTo(point) <= maxDistance) {
							members.push(other);
							isAssigned[other] = true;
						} else {
							// Ya está en un grupo, no se agrupa o queda lejos
						}
					}

					if (members.length >= BimViewerManager._MARKER_GROUP_MIN_MEMBERS) {
						result.push(members);
					} else {
						// Un marcador solo no forma grupo
					}
				} else {
					// Ya está en un grupo o no se agrupa
				}
			}
		} else {
			// No hay escena: no hay nada que agrupar
		}

		return result;
	}

	/**
	 * Crea la figura de un grupo: un círculo blanco con el número de marcadores.
	 * @param count Número de marcadores del grupo.
	 * @param position Coordenada del mundo donde se pinta.
	 */
	private createGroupSprite(count: number, position: THREE.Vector3): THREE.Sprite {
		const material: THREE.SpriteMaterial = new THREE.SpriteMaterial({
			depthTest: false,
			map: this.getGroupTexture(count),
			sizeAttenuation: false,
			transparent: true
		});
		const sprite: THREE.Sprite = new THREE.Sprite(material);
		const scale: number = BimViewerManager._MARKER_SIZE * BimViewerManager._MARKER_GROUP_SCALE;

		sprite.position.copy(position);
		sprite.scale.set(scale, scale, 1);
		sprite.renderOrder = 1;

		return sprite;
	}

	/**
	 * Acerca la cámara a los marcadores de un grupo.
	 * @param groupIndex Posición del grupo en la lista de grupos pintados.
	 */
	private focusGroup(groupIndex: number): void {
		const members: number[] | undefined = this._GroupMembers[groupIndex];

		if (!CheckUtils.IsNull(this._World) && !CheckUtils.IsUndefined(members)) {
			const box: THREE.Box3 = new THREE.Box3();

			for (const index of members) {
				const position: BimViewerPoint = this._Markers[index].Position;

				box.expandByPoint(new THREE.Vector3(position.X, position.Y, position.Z));
			}

			// Se encuadra la esfera que envuelve al grupo, y no su caja: con la caja, mirando a lo largo de un grupo alargado la
			// cámara se quedaría pegada a él
			const sphere: THREE.Sphere = box.getBoundingSphere(new THREE.Sphere());

			sphere.radius += BimViewerManager._MARKER_GROUP_FIT_MARGIN;
			this._World.camera.controls.fitToSphere(sphere, true).catch((error: Error): void => {
				console.warn(`BimViewerManager.focusGroup() => no se ha podido acercar la cámara al grupo: ${error.message}`);
			});
		} else {
			// No hay escena o el grupo ya no existe
		}
	}

	/**
	 * Devuelve la imagen de un grupo, creándola la primera vez que se pide un número de marcadores.
	 * @param count Número de marcadores del grupo.
	 */
	private getGroupTexture(count: number): THREE.CanvasTexture {
		let result: THREE.CanvasTexture | undefined = this._GroupTextures.get(count);

		if (CheckUtils.IsUndefined(result)) {
			result = new THREE.CanvasTexture(BimViewerMarkerPainter.CreateGroupCanvas(count));
			this._GroupTextures.set(count, result);
		} else {
			// La imagen ya estaba creada
		}

		return result;
	}

	/**
	 * Calcula la opacidad con la que se pinta un marcador: la suya, atenuada si lo pide y el puntero no está encima de él. El
	 * marcador seleccionado no se atenúa.
	 * @param marker Marcador a pintar.
	 */
	private getMarkerOpacity(marker: BimViewerMarker): number {
		const isDimmed: boolean = marker.DimWhenIdle && marker.Id !== this._HoveredMarkerId && marker.Id !== this._SelectedMarkerId;

		return isDimmed ? marker.Opacity * BimViewerManager._MARKER_DIM_FACTOR : marker.Opacity;
	}

	/** Recalcula la opacidad de todas las figuras de marcadores, sin volver a crearlas. */
	private refreshMarkerOpacity(): void {
		for (let index: number = 0; index < this._MarkerSprites.length; ++index) {
			const marker: BimViewerMarker | undefined = this._Markers[index];

			if (CheckUtils.IsUndefined(marker)) {
				// Las figuras se están repintando: se calculará al crearlas
			} else {
				this._MarkerSprites[index].material.opacity = this.getMarkerOpacity(marker);
			}
		}
	}

	/**
	 * Fija el marcador cuyo elemento anclado se resalta con su color. Solo se resalta si el marcador lo pide y está anclado.
	 * @param marker Marcador seleccionado. Con `null`, no se resalta ninguno.
	 */
	private setHighlightMarker(marker: BimViewerMarker | null): void {
		const target: BimViewerMarker | null =
			!CheckUtils.IsNull(marker) && marker.HighlightOnSelect && !CheckUtils.IsNull(marker.AnchorId) ? marker : null;

		if (CheckUtils.IsNull(target) && CheckUtils.IsNull(this._HighlightMarker)) {
			// Ni había resaltado de marcador ni lo hay ahora
		} else {
			this._HighlightMarker = target;
			this.refreshHighlight().catch((error: Error): void => {
				console.warn(`BimViewerManager.refreshHighlight() => no se ha podido actualizar el resaltado: ${error.message}`);
			});
		}
	}

	/**
	 * Anota el marcador que tiene el puntero encima, atenúa o recupera los marcadores que lo piden y avisa del cambio.
	 * @param markerId Identificador del marcador bajo el puntero. Con `null`, no hay ninguno.
	 * @param clientX Posición horizontal del puntero en la ventana.
	 * @param clientY Posición vertical del puntero en la ventana.
	 */
	private setHoveredMarker(markerId: number | null, clientX: number, clientY: number): void {
		if (markerId === this._HoveredMarkerId) {
			// El marcador bajo el puntero no ha cambiado
		} else {
			this._HoveredMarkerId = markerId;
			this.refreshMarkerOpacity();
			this.OnMarkerHovered?.(markerId, clientX, clientY);
		}
	}

	/** Deja resaltado el elemento anclado al marcador seleccionado, si este lo pide. */
	private syncSelectedHighlight(): void {
		const selected: BimViewerMarker | undefined = this._Markers.find(
			(marker: BimViewerMarker): boolean => marker.Id === this._SelectedMarkerId
		);

		this.setHighlightMarker(CheckUtils.IsUndefined(selected) ? null : selected);
	}

	/** Reagrupa los marcadores según la vista actual de la cámara. Solo repinta si los grupos han cambiado. */
	private updateMarkerGroups(): void {
		if (this._Destroyed || CheckUtils.IsNull(this._World)) {
			// El visor ya no existe o aún no hay escena
		} else {
			const groups: number[][] = this.computeMarkerGroups();
			const signature: string = groups.map((members: number[]): string => members.join(',')).join('|');

			if (signature === this._GroupSignature) {
				// Los grupos son los mismos: no hay nada que repintar
			} else {
				this._GroupSignature = signature;
				this.applyMarkerGroups(groups);
			}
		}
	}

	/** Libera el modelo cargado, si lo hay. */
	private async disposeCurrentModel(): Promise<void> {
		const previousModelId: string | null = this._CurrentModelId;

		// Se olvida antes de liberarlo para que nada opere sobre un modelo que se está destruyendo
		this._CurrentModelId = null;
		this._DefaultView = null;
		this._HighlightedLocalId = null;
		this._HighlightMarker = null;

		if (CheckUtils.IsNull(previousModelId)) {
			// No había ningún modelo cargado
		} else {
			await this._Components.get(OBC.FragmentsManager).core.disposeModel(previousModelId);
		}
	}

	/** Encuadra la cámara sobre el modelo cargado. */
	private async frameModel(): Promise<void> {
		if (CheckUtils.IsNull(this._World)) {
			console.warn('BimViewerManager.frameModel() => el visor no está inicializado');
		} else {
			const boundingBoxer: OBC.BoundingBoxer = this._Components.get(OBC.BoundingBoxer);

			// Se vacía antes de añadir: si no, cada llamada acumularía las cajas de las anteriores
			boundingBoxer.list.clear();
			boundingBoxer.addFromModels();

			const box: THREE.Box3 = boundingBoxer.get();

			if (box.isEmpty()) {
				// Una caja vacía tiene límites infinitos: encuadrarla dejaría la cámara con valores NaN
				console.warn('BimViewerManager.frameModel() => el modelo no tiene geometría que encuadrar');
			} else {
				await this._World.camera.controls.fitToBox(box, false);
				this.SetCurrentViewAsDefault();
			}
		}
	}

	/**
	 * Crea el mundo 3D y prepara el cargador de IFC.
	 * @param container Elemento donde se dibuja el visor.
	 */
	private async initWorld(container: HTMLDivElement): Promise<void> {
		container.addEventListener('pointercancel', this._OnContainerPointerCancel);
		container.addEventListener('pointerdown', this._OnContainerPointerDown);
		// En captura, para atender antes que la cámara una pulsación sobre un marcador
		container.addEventListener('pointerdown', this._OnContainerPointerDownCapture, true);
		container.addEventListener('pointerleave', this._OnContainerPointerLeave);
		container.addEventListener('pointermove', this._OnContainerPointerMove);
		container.addEventListener('pointerup', this._OnContainerPointerUp);

		const world: OBC.SimpleWorld<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBC.SimpleRenderer> = this._Components
			.get(OBC.Worlds)
			.create<OBC.SimpleScene, OBC.OrthoPerspectiveCamera, OBC.SimpleRenderer>();

		world.scene = new OBC.SimpleScene(this._Components);
		world.scene.setup();
		world.renderer = new OBC.SimpleRenderer(this._Components, container);
		world.renderer.showLogo = false;
		world.camera = new OBC.OrthoPerspectiveCamera(this._Components);
		this._Canvas = world.renderer.three.domElement;
		this._Components.init();
		this._Grid = this._Components.get(OBC.Grids).create(world);
		this._World = world;
		this.applyStyle();
		this.applyMarkers();

		const fragments: OBC.FragmentsManager = this._Components.get(OBC.FragmentsManager);

		fragments.init(BimViewerManager._WORKER_URL);
		world.camera.controls.addEventListener('update', (): void => {
			if (this._Destroyed) {
				// El visor ya se ha liberado: no hay nada que repintar
			} else {
				fragments.core.update();
				this.updateMarkerGroups();
				this.notifyViewChanged();
			}
		});
		fragments.list.onItemSet.add(({ value: model }): void => {
			model.useCamera(world.camera.three);
			world.scene.three.add(model.object);
			fragments.core.update(true);
		});

		await this._Components.get(OBC.IfcLoader).setup({
			autoSetWasm: false,
			wasm: { path: BimViewerManager._WASM_PATH, absolute: true }
		});

		if (this._Destroyed) {
			// Dispose se llamó mientras se inicializaba: se libera de nuevo por si algo se creó después
			this._Components.dispose();
		} else {
			// Se vuelve a aplicar por si el aspecto cambió durante la inicialización
			this.applyStyle();
		}
	}

	/**
	 * Indica si una carga ya no es la vigente: se pidió otra posterior o el visor se liberó.
	 * @param loadToken Número de la carga a comprobar.
	 */
	private isLoadObsolete(loadToken: number): boolean {
		return this._Destroyed || loadToken !== this._LoadToken;
	}

	/**
	 * Carga el modelo en la escena y lo encuadra. Si mientras tanto llega una carga posterior, libera el modelo en vez de dejarlo.
	 * @param content Contenido del fichero IFC.
	 * @param defaultView Vista por defecto con la que se arranca. Con `null` es la del encuadre del modelo.
	 * @param currentView Vista en la que se coloca la cámara al terminar de cargar. Con `null` se queda en la vista por defecto.
	 * @param loadToken Número de esta carga, para saber si sigue siendo la vigente.
	 */
	private async loadContent(
		content: Blob,
		defaultView: BimViewerView | null,
		currentView: BimViewerView | null,
		loadToken: number
	): Promise<void> {
		await this.awaitReady();

		if (this.isLoadObsolete(loadToken)) {
			// Se pidió otra carga posterior que sustituirá a esta
		} else {
			await this.disposeCurrentModel();

			const bytes: Uint8Array = new Uint8Array(await content.arrayBuffer());

			if (this.isLoadObsolete(loadToken)) {
				// Llegó otra carga mientras se leía el contenido
			} else {
				const modelId: string = `bim-model-${loadToken}`;

				await this.loadModelIntoScene(bytes, modelId);

				if (this._Destroyed) {
					// Los componentes ya se han liberado y con ellos el modelo
				} else if (this.isLoadObsolete(loadToken)) {
					// Llegó otra carga: este modelo no debe quedarse en la escena junto al nuevo
					await this._Components.get(OBC.FragmentsManager).core.disposeModel(modelId);
				} else {
					this._CurrentModelId = modelId;
					await this.frameModel();

					// Lo guardado manda sobre el encuadre automático: primero la vista por defecto y, encima, la posición actual
					if (!CheckUtils.IsNull(defaultView)) {
						this._DefaultView = defaultView;
						await this.moveCameraTo(defaultView);
					} else {
						// Sin vista por defecto guardada: vale la del encuadre
					}

					if (!CheckUtils.IsNull(currentView)) {
						await this.moveCameraTo(currentView);
					} else {
						// Sin posición guardada: la cámara se queda donde está
					}
				}
			}
		}
	}

	/**
	 * Carga el IFC y espera a que el modelo esté añadido a la escena.
	 * @param bytes Contenido del fichero IFC.
	 * @param modelId Identificador con el que se registra el modelo.
	 */
	private async loadModelIntoScene(bytes: Uint8Array, modelId: string): Promise<void> {
		const fragments: OBC.FragmentsManager = this._Components.get(OBC.FragmentsManager);
		let resolveAdded: () => void = (): void => undefined;

		// La carga termina antes de que el modelo esté en la escena: se espera su evento aparte, registrado antes de cargar
		const modelAdded: Promise<void> = new Promise<void>((resolve: () => void): void => {
			resolveAdded = resolve;
		});
		const onModelAdded: (data: { key: string }) => void = (data: { key: string }): void => {
			if (data.key === modelId) {
				resolveAdded();
			} else {
				// No es el modelo que se espera
			}
		};
		// Al liberar el visor el evento ya no llegará: se desbloquea la espera
		const onDisposed: () => void = (): void => resolveAdded();

		fragments.list.onItemSet.add(onModelAdded);
		this._DisposeController.signal.addEventListener('abort', onDisposed);

		try {
			await this._Components.get(OBC.IfcLoader).load(bytes, true, modelId);
			await modelAdded;
		} finally {
			fragments.list.onItemSet.remove(onModelAdded);
			this._DisposeController.signal.removeEventListener('abort', onDisposed);
		}
	}

	/**
	 * Coloca la cámara en una vista, sin animación.
	 * @param view Vista a la que se mueve la cámara.
	 */
	private async moveCameraTo(view: BimViewerView): Promise<void> {
		if (CheckUtils.IsNull(this._World)) {
			console.warn('BimViewerManager.moveCameraTo() => el visor no está inicializado');
		} else {
			await this._World.camera.controls.setLookAt(
				view.Position.X,
				view.Position.Y,
				view.Position.Z,
				view.Target.X,
				view.Target.Y,
				view.Target.Z,
				false
			);
		}
	}

	/**
	 * Busca el punto del modelo bajo el puntero y lo comunica a quien escuche.
	 * @param clientX Posición horizontal del puntero en la ventana.
	 * @param clientY Posición vertical del puntero en la ventana.
	 */
	private async notifyPointClicked(clientX: number, clientY: number): Promise<void> {
		const onPointClicked: ((hit: BimViewerHit) => void) | null = this.OnPointClicked;
		const isHighlightEnabled: boolean = !CheckUtils.IsNull(this._Style) && this._Style.HighlightEnabled;

		if (CheckUtils.IsNull(onPointClicked) && !isHighlightEnabled) {
			// Nadie a quien le interese el clic
		} else {
			const hit: BimViewerHit | null = await this.raycastModel(clientX, clientY);

			if (this._Destroyed) {
				// El visor se liberó mientras se resolvía el clic
			} else {
				if (isHighlightEnabled) {
					// Un clic fuera del modelo quita el resaltado
					this._HighlightedLocalId = CheckUtils.IsNull(hit) ? null : hit.ElementId;
					await this.refreshHighlight();
				} else {
					// El resaltado está desactivado
				}

				if (CheckUtils.IsNull(hit) || CheckUtils.IsNull(onPointClicked)) {
					// El clic no cae sobre el modelo o nadie escucha
				} else {
					onPointClicked(hit);
				}
			}
		}
	}

	/** Avisa de la vista actual de la cámara, si hay modelo cargado y alguien escucha. */
	private notifyViewChanged(): void {
		const onViewChanged: ((view: BimViewerView) => void) | null = this.OnViewChanged;
		const view: BimViewerView | null = this.readCurrentView();

		if (CheckUtils.IsNull(onViewChanged) || CheckUtils.IsNull(view)) {
			// Nadie escucha o aún no hay modelo cargado
		} else {
			onViewChanged(view);
		}
	}

	/**
	 * Lee la vista actual de la cámara.
	 * @returns La vista actual, o `null` si no hay modelo cargado.
	 */
	private readCurrentView(): BimViewerView | null {
		let result: BimViewerView | null = null;

		if (!CheckUtils.IsNull(this._World) && !CheckUtils.IsNull(this._CurrentModelId)) {
			const position: THREE.Vector3 = new THREE.Vector3();
			const target: THREE.Vector3 = new THREE.Vector3();

			this._World.camera.controls.getPosition(position);
			this._World.camera.controls.getTarget(target);
			result = new BimViewerView(
				new BimViewerPoint(position.x, position.y, position.z),
				new BimViewerPoint(target.x, target.y, target.z)
			);
		} else {
			// No hay modelo cargado: no hay vista que leer
		}

		return result;
	}

	/**
	 * Pide que se actualice el resaltado. Las peticiones se ejecutan una tras otra, para que dos seguidas no se mezclen: cada
	 * una aplica el estado que haya cuando le toca.
	 */
	private refreshHighlight(): Promise<void> {
		const currentRefresh: Promise<void> = this._HighlightQueue.then((): Promise<void> => this.applyHighlight());

		// Si esta actualización falla, el error le llega a quien la pidió y la cola sigue para la siguiente
		this._HighlightQueue = currentRefresh.catch((): void => undefined);

		return currentRefresh;
	}

	//#endregion PRIVATE METHODS

	//#region PRIVATE STATIC METHODS

	/**
	 * Lee un atributo de texto de los datos de un elemento.
	 * @param item Datos del elemento.
	 * @param name Nombre del atributo.
	 * @returns El texto del atributo, o una cadena vacía si el elemento no lo tiene o no es un texto.
	 */
	private static readTextAttribute(item: ItemData, name: string): string {
		const attribute: ItemAttribute | ItemData[] | undefined = item[name];
		let result: string = '';

		if (!CheckUtils.IsUndefined(attribute) && !Array.isArray(attribute) && typeof attribute.value === 'string') {
			result = attribute.value;
		} else {
			// El elemento no tiene el atributo o no es un texto
		}

		return result;
	}

	//#endregion PRIVATE STATIC METHODS
}
