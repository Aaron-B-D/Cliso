import * as OBC from '@thatopen/components';
import { type FragmentsModel, type RaycastResult } from '@thatopen/fragments';
import * as THREE from 'three';

import { type BimViewerPoint, type BimViewerStyle } from 'src/app/shared/definitions/bimViewer.definitions';
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

	/** `true` cuando el visor ya se ha liberado y no puede volver a usarse. */
	private _Destroyed: boolean = false;

	/** Se cancela al liberar el visor para desbloquear las esperas de eventos que ya no llegarán. */
	private readonly _DisposeController: AbortController = new AbortController();

	/** Rejilla de la escena. Es `null` hasta que se crea el mundo. */
	private _Grid: OBC.SimpleGrid | null = null;

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
	 */
	public async LoadContent(content: Blob): Promise<void> {
		if (this._Destroyed) {
			// El visor ya no existe: no hay nada que cargar
		} else {
			const loadToken: number = ++this._LoadToken;
			const currentLoad: Promise<void> = this._LoadQueue.then((): Promise<void> => this.loadContent(content, loadToken));

			// Si esta carga falla, el error le llega a quien la pidió y la cola sigue para la siguiente
			this._LoadQueue = currentLoad.catch((): void => undefined);

			await currentLoad;
		}
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

	/** Aplica el aspecto a la escena y a la rejilla. Si aún no existen, se aplicará al crearlos. */
	private applyStyle(): void {
		if (CheckUtils.IsNull(this._World) || CheckUtils.IsNull(this._Grid) || CheckUtils.IsNull(this._Style)) {
			// Aún no hay escena: se aplicará al crearla
		} else {
			this._World.scene.config.backgroundColor = new THREE.Color(this._Style.BackgroundColor);
			this._Grid.config.color = new THREE.Color(this._Style.GridColor);
			this._Grid.config.visible = this._Style.GridVisible;
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
	 * @param loadToken Número de esta carga, para saber si sigue siendo la vigente.
	 */
	private async loadContent(content: Blob, loadToken: number): Promise<void> {
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
	 * Busca el punto del modelo bajo el puntero y lo comunica a quien escuche.
	 * @param clientX Posición horizontal del puntero en la ventana.
	 * @param clientY Posición vertical del puntero en la ventana.
	 */
	private async notifyPointClicked(clientX: number, clientY: number): Promise<void> {
		const onPointClicked: ((point: BimViewerPoint) => void) | null = this.OnPointClicked;

		if (
			CheckUtils.IsNull(this._World) ||
			CheckUtils.IsNull(this._Canvas) ||
			CheckUtils.IsNull(this._CurrentModelId) ||
			CheckUtils.IsNull(onPointClicked)
		) {
			// No hay modelo cargado o nadie escuchando
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

				if (this._Destroyed || CheckUtils.IsNull(hit)) {
					// El visor se liberó mientras se resolvía el clic, o el clic no cae sobre el modelo
				} else {
					onPointClicked({ X: hit.point.x, Y: hit.point.y, Z: hit.point.z });
				}
			}
		}
	}

	//#endregion PRIVATE METHODS
}
