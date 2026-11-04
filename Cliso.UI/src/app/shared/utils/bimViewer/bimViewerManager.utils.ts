import * as OBC from '@thatopen/components';
import { FragmentsModel, RaycastResult, RenderedFaces } from '@thatopen/fragments';
import * as THREE from 'three';

import { BimViewerPoint } from 'src/app/shared/models/bimViewer/bimViewerPoint.models';
import { BimViewerStyle } from 'src/app/shared/models/bimViewer/bimViewerStyle.models';
import { BimViewerView } from 'src/app/shared/models/bimViewer/bimViewerView.models';
import { CheckUtils } from 'src/app/shared/utils/check.utils';

/** Motor 3D que representa un modelo IFC: crea la escena y la cámara, carga el modelo y avisa de los clics sobre él. */
export class BimViewerManager {
	//#region PRIVATE CONSTANTS

	/** Desplazamiento máximo (en píxeles) del puntero entre pulsar y soltar para contarlo como clic y no como arrastre. */
	private static readonly _CLICK_MAX_MOVEMENT_PX: number = 4;

	/** Carpeta servida como asset donde está `web-ifc.wasm` (evita el CDN externo que ofrece la librería). */
	private static readonly _WASM_PATH: string = new URL('thatopen/', document.baseURI).href;

	/** Fichero servido como asset del worker de Fragments (evita el CDN externo que ofrece la librería). */
	private static readonly _WORKER_URL: string = new URL('thatopen/worker.mjs', document.baseURI).href;

	//#endregion PRIVATE CONSTANTS

	//#region PUBLIC PROPERTIES

	/** Se llama con la vista de la cámara cada vez que se mueve, con el modelo ya cargado. Se llama muy seguido: quien escuche debe aligerarlo. */
	public OnViewChanged: ((view: BimViewerView) => void) | null = null;

	/** Se llama con el punto del modelo (en coordenadas del mundo) sobre el que se hace clic. No se llama si el clic no cae sobre el modelo. */
	public OnPointClicked: ((point: BimViewerPoint) => void) | null = null;

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

	/** Rejilla de la escena. Es `null` hasta que se crea el mundo. */
	private _Grid: OBC.SimpleGrid | null = null;

	/** Cola que serializa las actualizaciones del resaltado: cada una espera a que termine la anterior. */
	private _HighlightQueue: Promise<void> = Promise.resolve();

	/** Identificador, dentro del modelo, de la pieza resaltada. Es `null` si no hay ninguna. */
	private _HighlightedLocalId: number | null = null;

	/** Cola que serializa las cargas: cada una espera a que termine la anterior. */
	private _LoadQueue: Promise<void> = Promise.resolve();

	/** Número de la última carga pedida. Una carga con un número anterior ya no es la vigente y descarta su resultado. */
	private _LoadToken: number = 0;

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

	/** Posición en la que se pulsó el puntero. Es `null` si no hay una pulsación en curso. */
	private _PointerDownPosition: { x: number; y: number } | null = null;

	/** Resultado de `Init`. Es `null` hasta que se llama a `Init`. */
	private _Ready: Promise<void> | null = null;

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
		this._DisposeController.abort();
		this._Container?.removeEventListener('pointercancel', this._OnContainerPointerCancel);
		this._Container?.removeEventListener('pointerdown', this._OnContainerPointerDown);
		this._Container?.removeEventListener('pointerup', this._OnContainerPointerUp);
		this._Components.dispose();
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
	 * Cambia el aspecto del visor, también con un modelo ya cargado.
	 * @param style Nuevo aspecto.
	 */
	public SetStyle(style: BimViewerStyle): void {
		this._Style = style;
		this.applyStyle();
	}

	//#endregion PUBLIC METHODS

	//#region PRIVATE METHODS

	/** Deja resaltada, con el color del aspecto, la pieza elegida; si el resaltado está desactivado o no hay pieza, lo quita. */
	private async applyHighlight(): Promise<void> {
		const modelId: string | null = this._CurrentModelId;

		if (!this._Destroyed && !CheckUtils.IsNull(modelId) && !CheckUtils.IsNull(this._Style)) {
			const fragments: OBC.FragmentsManager = this._Components.get(OBC.FragmentsManager);
			const model: FragmentsModel | undefined = fragments.list.get(modelId);

			if (CheckUtils.IsUndefined(model)) {
				// El modelo ya no está cargado
			} else {
				await model.resetHighlight();

				if (this._Style.HighlightEnabled && !CheckUtils.IsNull(this._HighlightedLocalId)) {
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

			// Al activar, desactivar o recolorear el resaltado, la pieza resaltada se actualiza
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

	/** Libera el modelo cargado, si lo hay. */
	private async disposeCurrentModel(): Promise<void> {
		const previousModelId: string | null = this._CurrentModelId;

		// Se olvida antes de liberarlo para que nada opere sobre un modelo que se está destruyendo
		this._CurrentModelId = null;
		this._DefaultView = null;
		this._HighlightedLocalId = null;

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

		const fragments: OBC.FragmentsManager = this._Components.get(OBC.FragmentsManager);

		fragments.init(BimViewerManager._WORKER_URL);
		world.camera.controls.addEventListener('update', (): void => {
			if (this._Destroyed) {
				// El visor ya se ha liberado: no hay nada que repintar
			} else {
				fragments.core.update();
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
		const onPointClicked: ((point: BimViewerPoint) => void) | null = this.OnPointClicked;
		const isHighlightEnabled: boolean = !CheckUtils.IsNull(this._Style) && this._Style.HighlightEnabled;

		if (
			CheckUtils.IsNull(this._World) ||
			CheckUtils.IsNull(this._Canvas) ||
			CheckUtils.IsNull(this._CurrentModelId) ||
			(CheckUtils.IsNull(onPointClicked) && !isHighlightEnabled)
		) {
			// No hay modelo cargado o nadie a quien le interese el clic
		} else {
			const model: FragmentsModel | undefined = this._Components.get(OBC.FragmentsManager).list.get(this._CurrentModelId);

			if (CheckUtils.IsUndefined(model)) {
				console.warn('BimViewerManager.notifyPointClicked() => el modelo ya no está cargado');
			} else {
				const hit: RaycastResult | null = await model.raycast({
					camera: this._World.camera.three,
					mouse: new THREE.Vector2(clientX, clientY),
					dom: this._Canvas
				});

				if (this._Destroyed) {
					// El visor se liberó mientras se resolvía el clic
				} else {
					if (isHighlightEnabled) {
						// Un clic fuera del modelo quita el resaltado
						this._HighlightedLocalId = CheckUtils.IsNull(hit) ? null : hit.localId;
						await this.refreshHighlight();
					} else {
						// El resaltado está desactivado
					}

					if (CheckUtils.IsNull(hit) || CheckUtils.IsNull(onPointClicked)) {
						// El clic no cae sobre el modelo o nadie escucha
					} else {
						onPointClicked(new BimViewerPoint(hit.point.x, hit.point.y, hit.point.z));
					}
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
}
