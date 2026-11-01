import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogRef } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';

import { BimViewerComponent } from 'src/app/shared/components/bimViewer/bimViewer.component';
import { EditorShellComponent } from 'src/app/shared/components/editorShell/editorShell.component';
import { ID_NUMERIC_UNDEFINED, STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { type BimModelDto } from 'src/app/shared/definitions/dtos.definitions';
import { IconName } from 'src/app/shared/definitions/icons.definitions';
import { NotificationLevel } from 'src/app/shared/definitions/notifications.definitions';
import { BimModel } from 'src/app/shared/models/bimModel/bimModel.models';
import { ConfirmDialogService } from 'src/app/shared/services/confirmDialog.service';
import { DataAccessService } from 'src/app/shared/services/dataAccess.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { CheckUtils } from 'src/app/shared/utils/check.utils';
import { ErrorUtils } from 'src/app/shared/utils/error.utils';
import { HttpRequestCanceller } from 'src/app/shared/utils/httpRequestCanceller.utils';
import { IconsUtils } from 'src/app/shared/utils/icons.utils';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';
import { BimModelMapper } from 'src/app/shared/utils/mappers/bimModelMapper.utils';
import { RequestUtils } from 'src/app/shared/utils/request.utils';
import { TryGetResult } from 'src/app/shared/models/common/tryGetResult.models';

/** Ficha de un modelo en la lista del editor, con lo que la plantilla necesita ya calculado. */
type BimModelListItem = {
	FileText: string;
	IsSelected: boolean;
	Model: BimModel;
};

/** Editor de los modelos BIM: lista de modelos, sus datos generales con la carga del fichero IFC y su previsualización 3D. */
@Component({
	selector: 'app-bim-model-editor',
	imports: [BimViewerComponent, EditorShellComponent, MatFormFieldModule, MatInputModule, MatProgressBarModule, MatTabsModule],
	templateUrl: './bimModelEditor.component.html',
	styleUrl: './bimModelEditor.component.scss'
})
export class BimModelEditorComponent implements OnDestroy, OnInit {
	//#region PUBLIC CONSTANTS

	/** Extensión que debe tener el fichero del modelo. */
	public readonly FILE_EXTENSION: string = '.ifc';

	//#region LANGUAGE TEXTS

	/** Etiqueta de la descripción. */
	public readonly DESCRIPTION_TEXT: string = LanguageManager.GetText('BME_DESCRIPTION');

	/** Texto de la zona donde se suelta o se elige el fichero IFC. */
	public readonly DROP_FILE_TEXT: string = LanguageManager.GetText('BME_DROP_FILE');

	/** Título de la pestaña de datos generales. */
	public readonly GENERAL_TEXT: string = LanguageManager.GetText('BME_GENERAL');

	/** Etiqueta del nombre. */
	public readonly NAME_TEXT: string = LanguageManager.GetText('BME_NAME');

	/** Aviso de que el nombre es obligatorio. */
	public readonly NAME_REQUIRED_TEXT: string = LanguageManager.GetText('BME_NAME_REQUIRED');

	/** Texto mientras se carga la lista o el visor. */
	public readonly LOADING_TEXT: string = LanguageManager.GetText('WEB_LOADING');

	/** Texto cuando no hay ningún modelo en la lista. */
	public readonly NO_MODELS_TEXT: string = LanguageManager.GetText('BME_NO_MODELS');

	/** Texto cuando no hay ningún modelo seleccionado. */
	public readonly NO_SELECTION_TEXT: string = LanguageManager.GetText('BME_NO_SELECTION');

	/** Etiqueta de las observaciones. */
	public readonly OBSERVATIONS_TEXT: string = LanguageManager.GetText('BME_OBSERVATIONS');

	/** Título de la pestaña de previsualización. */
	public readonly PREVIEW_TEXT: string = LanguageManager.GetText('BME_PREVIEW');

	/** Texto de ayuda del buscador. */
	public readonly SEARCH_TEXT: string = LanguageManager.GetText('BME_SEARCH');

	/** Título del editor. */
	public readonly TITLE_TEXT: string = LanguageManager.GetText('WEB_MODELS');

	//#endregion LANGUAGE TEXTS

	//#endregion PUBLIC CONSTANTS

	//#region PRIVATE CONSTANTS

	/** Posición de la pestaña de datos generales. */
	private readonly _GENERAL_TAB_INDEX: number = 0;

	/** Posición de la pestaña de previsualización. */
	private readonly _PREVIEW_TAB_INDEX: number = 1;

	//#region LANGUAGE TEXTS

	/** Aviso de que el modelo se ha añadido. */
	private readonly _ADDED_TEXT: string = LanguageManager.GetText('BME_ADDED');

	/** Aviso de que el modelo se ha eliminado. */
	private readonly _DELETED_TEXT: string = LanguageManager.GetText('BME_DELETED');

	/** Aviso de que el modelo se ha modificado. */
	private readonly _UPDATED_TEXT: string = LanguageManager.GetText('BME_UPDATED');

	/** Pregunta de confirmación del borrado, con el nombre del modelo en `{0}`. */
	private readonly _DELETE_CONFIRM_TEXT: string = LanguageManager.GetText('BME_DELETE_CONFIRM');

	/** Aviso de que no se ha podido borrar el modelo. */
	private readonly _DELETE_ERROR_TEXT: string = LanguageManager.GetText('BME_DELETE_ERROR');

	/** Pregunta de confirmación para descartar los cambios sin guardar. */
	private readonly _DISCARD_CONFIRM_TEXT: string = LanguageManager.GetText('BME_DISCARD_CONFIRM');

	/** Aviso de que el fichero elegido no es un IFC. */
	private readonly _FILE_INVALID_TEXT: string = LanguageManager.GetText('BME_FILE_INVALID');

	/** Aviso de que no se han podido cargar los modelos. */
	private readonly _LOAD_ERROR_TEXT: string = LanguageManager.GetText('BME_LOAD_ERROR');

	/** Texto del fichero pendiente de subir, con su nombre en `{0}`. */
	private readonly _PENDING_FILE_TEXT: string = LanguageManager.GetText('BME_PENDING_FILE');

	/** Aviso de que no se ha podido guardar el modelo. */
	private readonly _SAVE_ERROR_TEXT: string = LanguageManager.GetText('BME_SAVE_ERROR');

	/** Aviso de que el modelo se ha guardado pero no se ha podido subir su fichero. */
	private readonly _UPLOAD_ERROR_TEXT: string = LanguageManager.GetText('BME_UPLOAD_ERROR');

	/** Mensaje de la subida del fichero, con el porcentaje en `{0}`. */
	private readonly _UPLOADING_TEXT: string = LanguageManager.GetText('BME_UPLOADING');

	/** Texto de un modelo sin fichero IFC. */
	private readonly _NO_FILE_TEXT: string = LanguageManager.GetText('BME_NO_FILE');

	//#endregion LANGUAGE TEXTS

	//#endregion PRIVATE CONSTANTS

	//#region PUBLIC PROPERTIES

	/** Datos del modelo abierto: son los que se editan, y solo se guardan al pulsar guardar. */
	public Draft: BimModel = this.createEmptyModel();

	/** `true` si hay un modelo seleccionado en la lista. */
	public HasSelection: boolean = false;

	/** `true` si hay un modelo abierto (seleccionado o nuevo): se muestra su detalle. */
	public HasDetail: boolean = false;

	/** `true` si hay algún modelo que mostrar en la lista. */
	public HasItems: boolean = false;

	/** `true` mientras se guarda o se borra: se bloquean los botones. */
	public IsBusy: boolean = false;

	/** `true` mientras se carga la lista de modelos: se muestra una barra de carga y el resto sigue disponible. */
	public IsLoadingList: boolean = true;

	/** `true` mientras se edita (o se añade) un modelo. */
	public IsEditing: boolean = false;

	/** Posición de la pestaña que se ve. */
	public TabIndex: number = 0;

	/** `true` si el detalle solo se puede leer. */
	public IsReadOnly: boolean = true;

	/** Fichas de la lista, ya filtradas por el buscador. */
	public ListItems: BimModelListItem[] = [];

	/** `true` si hay que avisar de que falta el nombre. */
	public NameError: boolean = false;

	/** Texto del fichero elegido que se subirá al guardar. Vacío si no hay ninguno. */
	public PendingFileText: string = STRING_UNDEFINED;

	/** Contenido IFC del modelo abierto, para la previsualización. */
	public PreviewContent: Blob | null = null;

	/** Porcentaje de la descarga del modelo para la previsualización. `null` si no se está descargando. */
	public PreviewProgress: number | null = null;

	/** `true` mientras se sube el fichero IFC. */
	public ShowUpload: boolean = false;

	/** Porcentaje de la subida del fichero IFC. */
	public UploadPercent: number = 0;

	/** Mensaje de la subida con su porcentaje. */
	public UploadText: string = STRING_UNDEFINED;

	/** Flecha de las fichas, que indica en móvil que se abren. */
	public ArrowIcon: string = IconsUtils.GetUrl(IconName.CHEVRON_RIGHT);

	//#endregion PUBLIC PROPERTIES

	//#region PRIVATE PROPERTIES

	/** Llamadas al API. */
	private readonly _DataAccess: DataAccessService;

	/** Diálogo que contiene el editor, para cerrarlo. */
	private readonly _DialogRef: MatDialogRef<BimModelEditorComponent>;

	/** Hace las preguntas de confirmación. */
	private readonly _Confirm: ConfirmDialogService;

	/** `true` si hay cambios sin guardar en el detalle. */
	private _IsDirty: boolean = false;

	/** `true` si, en el guardado en curso, los datos del modelo ya se han guardado (solo falta, si lo hay, el fichero). */
	private _IsDataSaved: boolean = false;

	/** `true` si el modelo abierto es nuevo y aún no se ha guardado. */
	private _IsNew: boolean = false;

	/** Avisa al usuario de los fallos. */
	private readonly _Notification: NotificationService;

	/** `true` si la pestaña de previsualización es la que se ve. */
	private _IsPreviewActive: boolean = false;

	/** Todos los modelos, sin filtrar. */
	private _Models: BimModel[] = [];

	/** Fichero elegido que se subirá al guardar. Es `null` si no hay ninguno. */
	private _PendingFile: File | null = null;

	/** Número de la última descarga pedida para la previsualización: una descarga anterior no toca el estado de la actual. */
	private _PreviewLoadId: number = 0;

	/** Identificador del modelo cuyo contenido tiene `PreviewContent`. */
	private _PreviewModelId: number = ID_NUMERIC_UNDEFINED;

	/** Corta las peticiones pendientes al cambiar de modelo y al cerrar el editor. */
	private readonly _Canceller: HttpRequestCanceller = new HttpRequestCanceller();

	/** Texto del buscador, en minúsculas. */
	private _SearchText: string = STRING_UNDEFINED;

	/** Modelo seleccionado en la lista. Es `null` si no hay ninguno, o si se está añadiendo uno nuevo. */
	private _Selected: BimModel | null = null;

	//#endregion PRIVATE PROPERTIES

	//#region CONSTRUCTOR

	/**
	 * @param dataAccess Llamadas al API.
	 * @param dialogRef Diálogo que contiene el editor.
	 * @param confirm Hace las preguntas de confirmación.
	 * @param notification Avisa al usuario de los fallos.
	 */
	constructor(
		dataAccess: DataAccessService,
		dialogRef: MatDialogRef<BimModelEditorComponent>,
		confirm: ConfirmDialogService,
		notification: NotificationService
	) {
		this._Confirm = confirm;
		this._DataAccess = dataAccess;
		this._DialogRef = dialogRef;
		this._Notification = notification;
	}

	//#endregion CONSTRUCTOR

	//#region ANGULAR LIFECYCLE

	public ngOnDestroy(): void {
		this._Canceller.Destroy();
	}

	public ngOnInit(): void {
		this.loadModels();
	}

	//#endregion ANGULAR LIFECYCLE

	//#region SUBSCRIBERS

	public async OnAddClicked(): Promise<void> {
		if (await this.confirmDiscard()) {
			this.setTab(this._GENERAL_TAB_INDEX);
			this.openModel(null);
			this._IsNew = true;
			this.setEditing(true);
			this.refreshDetail();
		} else {
			// El usuario prefiere seguir con lo que estaba editando
		}
	}

	public async OnBackClicked(): Promise<void> {
		if (!this.IsBusy && (await this.confirmDiscard())) {
			this.openModel(null);
		} else {
			// Hay una operación en curso o el usuario prefiere seguir con lo que estaba editando
		}
	}

	public async OnCloseRequested(): Promise<void> {
		if (!this.IsBusy && (await this.confirmDiscard())) {
			this._DialogRef.close();
		} else {
			// Hay una operación en curso o el usuario prefiere seguir con lo que estaba editando
		}
	}

	public OnDescriptionInput(event: Event): void {
		this.Draft.Description = (event.target as HTMLTextAreaElement).value;
		this._IsDirty = true;
	}

	public async OnDeleteClicked(): Promise<void> {
		if (!CheckUtils.IsNull(this._Selected)) {
			const model: BimModel = this._Selected;

			if (await this._Confirm.Ask(this._DELETE_CONFIRM_TEXT.replace('{0}', model.Name), true)) {
				await this.deleteModel(model);
			} else {
				// El usuario cancela el borrado
			}
		} else {
			// No hay nada que borrar
		}
	}

	public async OnDiscardClicked(): Promise<void> {
		if (await this.confirmDiscard()) {
			this.openModel(this._Selected);
		} else {
			// El usuario prefiere seguir con lo que estaba editando
		}
	}

	public OnEditClicked(): void {
		this.setEditing(true);
	}

	public OnFileDragOver(event: DragEvent): void {
		// Sin esto el navegador no permite soltar el fichero
		event.preventDefault();
	}

	public OnFileDropped(event: DragEvent): void {
		event.preventDefault();

		const file: File | undefined = event.dataTransfer?.files[0];

		if (!CheckUtils.IsNullOrUndefined(file)) {
			this.selectFile(file);
		} else {
			// No se ha soltado ningún fichero
		}
	}

	public OnFileSelected(event: Event): void {
		const input: HTMLInputElement = event.target as HTMLInputElement;
		const file: File | undefined = input.files?.[0];

		if (!CheckUtils.IsNullOrUndefined(file)) {
			this.selectFile(file);
		} else {
			// No se ha elegido ningún fichero
		}

		// Así se puede volver a elegir el mismo fichero
		input.value = STRING_UNDEFINED;
	}

	public OnNameInput(event: Event): void {
		this.Draft.Name = (event.target as HTMLInputElement).value;
		this.NameError = false;
		this._IsDirty = true;
	}

	public OnObservationsInput(event: Event): void {
		this.Draft.Observations = (event.target as HTMLTextAreaElement).value;
		this._IsDirty = true;
	}

	public async OnModelSelected(model: BimModel): Promise<void> {
		if (!this.IsBusy && (await this.confirmDiscard())) {
			this.openModel(model);
		} else {
			// Hay una operación en curso o el usuario prefiere seguir con lo que estaba editando
		}
	}

	public async OnSaveClicked(): Promise<void> {
		if (CheckUtils.IsEmptyString(this.Draft.Name)) {
			this.NameError = true;
		} else {
			await this.saveModel();
		}
	}

	public OnSearchChanged(text: string): void {
		this._SearchText = text.trim().toLowerCase();
		this.refreshList();
	}

	public OnTabIndexChanged(index: number): void {
		this.setTab(index);

		if (this._IsPreviewActive) {
			this.loadPreview();
		} else {
			// La previsualización ya no se ve: no se descarga nada
		}
	}

	//#endregion SUBSCRIBERS

	//#region PRIVATE METHODS

	/**
	 * Si hay cambios sin guardar, pregunta si se descartan.
	 * @returns `true` si se puede seguir (no había cambios o el usuario acepta descartarlos).
	 */
	private async confirmDiscard(): Promise<boolean> {
		let result: boolean = true;

		if (this.IsEditing && this._IsDirty) {
			result = await this._Confirm.Ask(this._DISCARD_CONFIRM_TEXT, false);
		} else {
			// No hay cambios que perder
		}

		return result;
	}

	/** Crea un modelo en blanco, para el detalle cuando no hay ninguno abierto o se está añadiendo uno. */
	private createEmptyModel(): BimModel {
		return new BimModel(ID_NUMERIC_UNDEFINED, STRING_UNDEFINED, STRING_UNDEFINED, STRING_UNDEFINED, STRING_UNDEFINED, 0, null);
	}

	/**
	 * Borra un modelo y lo quita de la lista.
	 * @param model Modelo a borrar.
	 */
	private async deleteModel(model: BimModel): Promise<void> {
		this.setBusy(true);

		try {
			const result: TryGetResult<void> = await RequestUtils.AwaitRequest(
				this._DataAccess.BimModels.Delete(model.Id, false),
				this._Canceller
			);

			if (result.Success) {
				this._Models = this._Models.filter((item: BimModel): boolean => item.Id !== model.Id);
				this.openModel(null);
				this._Notification.Send(this._DELETED_TEXT, NotificationLevel.SUCCESS);
			} else {
				// Petición cancelada: no hay nada que hacer
			}
		} catch (error) {
			this._Notification.Send(this._DELETE_ERROR_TEXT, NotificationLevel.DANGER);
			console.warn(`BimModelEditor.deleteModel() => ${ErrorUtils.GetMessage(error)}`);
		} finally {
			this.setBusy(false);
		}
	}

	/** Carga la lista de modelos. */
	private async loadModels(): Promise<void> {
		try {
			const result: TryGetResult<BimModelDto[]> = await RequestUtils.AwaitRequest(
				this._DataAccess.BimModels.GetAll(),
				this._Canceller
			);

			if (result.Success) {
				this._Models = (result.Result as BimModelDto[]).map((dto: BimModelDto): BimModel => BimModelMapper.ToModel(dto));
				this.refreshList();
			} else {
				// Petición cancelada: no hay nada que hacer
			}
		} catch (error) {
			this._Notification.Send(this._LOAD_ERROR_TEXT, NotificationLevel.DANGER);
			console.warn(`BimModelEditor.loadModels() => ${ErrorUtils.GetMessage(error)}`);
		} finally {
			// Si no se ha podido cargar, la lista se queda vacía: el editor sigue siendo usable
			this.IsLoadingList = false;
		}
	}

	/** Prepara el contenido para la previsualización: el fichero elegido, si lo hay, o si no el del modelo abierto, que se descarga si no se ha descargado ya. */
	private async loadPreview(): Promise<void> {
		const model: BimModel | null = this._Selected;

		if (!CheckUtils.IsNull(this._PendingFile)) {
			// Aún no está subido: se previsualiza el fichero local, y al guardar o descartar se vuelve a pedir el del modelo
			this.PreviewContent = this._PendingFile;
			this.PreviewProgress = null;
			this._PreviewModelId = ID_NUMERIC_UNDEFINED;
		} else if (!CheckUtils.IsNull(model) && model.FileName !== STRING_UNDEFINED && model.Id !== this._PreviewModelId) {
			const loadId: number = ++this._PreviewLoadId;

			this.PreviewProgress = 0;

			try {
				const result: TryGetResult<Blob> = await RequestUtils.AwaitRequestWithProgress(
					this._DataAccess.BimModels.GetContent(model.Id),
					this._Canceller,
					(percent: number): void => {
						if (loadId === this._PreviewLoadId) {
							this.PreviewProgress = percent;
						} else {
							// Ya se pidió la descarga de otro modelo
						}
					}
				);

				if (result.Success) {
					this.PreviewContent = result.Result;
					this._PreviewModelId = model.Id;
				} else {
					// Petición cancelada (se abrió otro modelo): no hay nada que hacer
				}
			} catch (error) {
				this._Notification.Send(this._LOAD_ERROR_TEXT, NotificationLevel.DANGER);
				console.warn(`BimModelEditor.loadPreview() => ${ErrorUtils.GetMessage(error)}`);
			} finally {
				// Una descarga anterior que termina tarde no apaga el progreso de la actual
				if (loadId === this._PreviewLoadId) {
					this.PreviewProgress = null;
				} else {
					// Sigue en curso la descarga posterior
				}
			}
		} else {
			// No hay modelo con fichero o ya está descargado
		}
	}

	/**
	 * Abre un modelo en el detalle, sin edición y sin cambios pendientes.
	 * @param model Modelo a abrir. Con `null`, el detalle queda cerrado.
	 */
	private openModel(model: BimModel | null): void {
		// Lo que estuviera descargándose del modelo anterior ya no hace falta
		this._Canceller.Cancel();

		this._IsDirty = false;
		this._IsNew = false;
		this._PendingFile = null;
		this._PreviewModelId = ID_NUMERIC_UNDEFINED;
		this._Selected = model;
		this.Draft = CheckUtils.IsNull(model) ? this.createEmptyModel() : this.cloneModel(model);
		this.NameError = false;
		this.PendingFileText = STRING_UNDEFINED;
		this.PreviewContent = null;
		this.PreviewProgress = null;
		this.setEditing(false);
		this.refreshDetail();
		this.refreshList();

		if (this._IsPreviewActive) {
			this.loadPreview();
		} else {
			// La previsualización se descargará al abrir su pestaña
		}
	}

	/**
	 * Hace una copia de un modelo, para editarla sin tocar el original hasta guardar.
	 * @param model Modelo a copiar.
	 */
	private cloneModel(model: BimModel): BimModel {
		return new BimModel(
			model.Id,
			model.Name,
			model.Description,
			model.Observations,
			model.FileName,
			model.FileSize,
			model.CreationDate
		);
	}

	/** Deja calculado lo que la plantilla necesita del modelo abierto. */
	private refreshDetail(): void {
		this.HasDetail = !CheckUtils.IsNull(this._Selected) || this._IsNew;
		this.HasSelection = !CheckUtils.IsNull(this._Selected);
	}

	/** Deja calculadas las fichas de la lista: ordenadas por nombre y filtradas por el buscador. */
	private refreshList(): void {
		const selectedId: number = CheckUtils.IsNull(this._Selected) ? ID_NUMERIC_UNDEFINED : this._Selected.Id;

		this.ListItems = this._Models
			.filter(
				(model: BimModel): boolean =>
					model.Name.toLowerCase().includes(this._SearchText) ||
					model.Description.toLowerCase().includes(this._SearchText) ||
					model.FileName.toLowerCase().includes(this._SearchText)
			)
			.sort((a: BimModel, b: BimModel): number => a.Name.localeCompare(b.Name))
			.map(
				(model: BimModel): BimModelListItem => ({
					FileText: model.FileName === STRING_UNDEFINED ? this._NO_FILE_TEXT : model.FileName,
					IsSelected: model.Id === selectedId,
					Model: model
				})
			);
		this.HasItems = this.ListItems.length > 0;
	}

	/** Guarda los datos del modelo abierto y, si se ha elegido, sube su fichero IFC. */
	private async saveModel(): Promise<void> {
		const wasNew: boolean = this._IsNew;

		this.setBusy(true);
		this._IsDataSaved = false;

		try {
			let saved: BimModel | null = await this.saveModelData();

			// A partir de aquí el modelo ya existe en el API (y la lista lo muestra): si falla la subida del fichero, no se ha perdido
			this._IsDataSaved = !CheckUtils.IsNull(saved);

			if (!CheckUtils.IsNull(saved) && !CheckUtils.IsNull(this._PendingFile)) {
				saved = await this.uploadFile(saved.Id, this._PendingFile);
			} else {
				// No hay fichero que subir
			}

			if (!CheckUtils.IsNull(saved)) {
				this.upsertModel(saved);
				this.openModel(saved);
				this._Notification.Send(wasNew ? this._ADDED_TEXT : this._UPDATED_TEXT, NotificationLevel.SUCCESS);
			} else {
				// Petición cancelada: no hay nada que hacer
			}
		} catch (error) {
			if (this._IsDataSaved) {
				// El modelo ya está creado o modificado: solo ha fallado el fichero, y se puede reintentar al guardar de nuevo
				this._Notification.Send(this._UPLOAD_ERROR_TEXT, NotificationLevel.DANGER);
				this.refreshDetail();
			} else {
				this._Notification.Send(this._SAVE_ERROR_TEXT, NotificationLevel.DANGER);
			}

			console.warn(`BimModelEditor.saveModel() => ${ErrorUtils.GetMessage(error)}`);
		} finally {
			this.setBusy(false);
			this.ShowUpload = false;
		}
	}

	/**
	 * Crea o modifica el modelo con los datos del detalle. El modelo guardado queda como el seleccionado, para que un fallo
	 * posterior (la subida del fichero) no lo duplique al volver a guardar ni descarte hasta los datos antiguos.
	 * @returns El modelo guardado, o `null` si la petición se canceló.
	 */
	private async saveModelData(): Promise<BimModel | null> {
		let result: BimModel | null = null;
		const dto: BimModelDto = BimModelMapper.ToDto(this.Draft);
		const response: TryGetResult<BimModelDto> = this._IsNew
			? await RequestUtils.AwaitRequest(this._DataAccess.BimModels.Add(dto), this._Canceller)
			: await RequestUtils.AwaitRequest(this._DataAccess.BimModels.Update(this.Draft.Id, dto), this._Canceller);

		if (response.Success) {
			result = BimModelMapper.ToModel(response.Result as BimModelDto);

			if (this._IsNew) {
				this._IsNew = false;
				this.Draft.Id = result.Id;
			} else {
				// Ya existía: solo se actualiza el seleccionado
			}

			// Si después falla la subida del fichero, descartar debe volver a lo ya guardado
			this._Selected = result;
			this.upsertModel(result);
		} else {
			// Petición cancelada: no hay nada que hacer
		}

		return result;
	}

	/**
	 * Valida el fichero elegido y lo deja pendiente de subir.
	 * @param file Fichero elegido o soltado.
	 */
	private selectFile(file: File): void {
		if (file.name.toLowerCase().endsWith(this.FILE_EXTENSION)) {
			this._PendingFile = file;
			this._IsDirty = true;
			this.PendingFileText = this._PENDING_FILE_TEXT.replace('{0}', file.name);
		} else {
			this._Notification.Send(this._FILE_INVALID_TEXT, NotificationLevel.WARNING);
		}
	}

	/**
	 * Marca si hay un guardado o un borrado en curso. Mientras lo hay, el diálogo no se puede cerrar (ni con Escape ni
	 * pulsando fuera), porque al cerrarse se cancelarían las peticiones y el modelo podría quedar a medias.
	 * @param isBusy `true` si hay una operación en curso.
	 */
	private setBusy(isBusy: boolean): void {
		this.IsBusy = isBusy;
		this._DialogRef.disableClose = isBusy;
	}

	/**
	 * Cambia la pestaña que se ve.
	 * @param index Posición de la pestaña.
	 */
	private setTab(index: number): void {
		this.TabIndex = index;
		this._IsPreviewActive = index === this._PREVIEW_TAB_INDEX;
	}

	/**
	 * Entra o sale del modo edición.
	 * @param isEditing `true` para editar.
	 */
	private setEditing(isEditing: boolean): void {
		this.IsEditing = isEditing;
		this.IsReadOnly = !isEditing;
	}

	/**
	 * Sube el fichero IFC de un modelo, mostrando el progreso.
	 * @param id Identificador del modelo.
	 * @param file Fichero IFC.
	 * @returns El modelo con su fichero ya actualizado, o `null` si la petición se canceló.
	 */
	private async uploadFile(id: number, file: File): Promise<BimModel | null> {
		let result: BimModel | null = null;

		this.ShowUpload = true;
		this.UploadPercent = 0;
		this.UploadText = this._UPLOADING_TEXT.replace('{0}', '0');

		const response: TryGetResult<BimModelDto> = await RequestUtils.AwaitRequestWithProgress(
			this._DataAccess.BimModels.SetContent(id, file),
			this._Canceller,
			(percent: number): void => {
				this.UploadPercent = percent;
				this.UploadText = this._UPLOADING_TEXT.replace('{0}', String(percent));
			}
		);

		if (response.Success) {
			result = BimModelMapper.ToModel(response.Result as BimModelDto);
		} else {
			// Petición cancelada: no hay nada que hacer
		}

		return result;
	}

	/**
	 * Añade el modelo a la lista o, si ya estaba, lo sustituye.
	 * @param model Modelo guardado.
	 */
	private upsertModel(model: BimModel): void {
		const index: number = this._Models.findIndex((item: BimModel): boolean => item.Id === model.Id);

		if (index >= 0) {
			this._Models[index] = model;
		} else {
			this._Models.push(model);
		}

		this.refreshList();
	}

	//#endregion PRIVATE METHODS
}
