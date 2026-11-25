import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';

import { VisualizationPieceWorkspaceComponent } from 'src/app/modules/visualizationEditor/components/pieceWorkspace/pieceWorkspace.component';
import { EditorCardComponent } from 'src/app/shared/components/editorCard/editorCard.component';
import { EditorShellComponent } from 'src/app/shared/components/editorShell/editorShell.component';
import { ID_NUMERIC_UNDEFINED, STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { BimModelDto, VisualizationDto } from 'src/app/shared/definitions/dtos.definitions';
import { ConfirmDialogType } from 'src/app/shared/definitions/dialogs.definitions';
import { IconName } from 'src/app/shared/definitions/icons.definitions';
import { NotificationLevel } from 'src/app/shared/definitions/notifications.definitions';
import { Permission } from 'src/app/shared/definitions/user.definitions';
import {
	VISUALIZATION_DEPTH_WITH_PIECES,
	VISUALIZATION_DEPTH_WITHOUT_PIECES,
	VISUALIZATION_LOGICAL_DELETE
} from 'src/app/shared/definitions/visualization.definitions';
import { CheckboxReadOnlyDirective } from 'src/app/shared/directives/checkboxReadOnly.directive';
import { InvalidDirective } from 'src/app/shared/directives/invalid.directive';
import { ReadOnlyDirective } from 'src/app/shared/directives/readOnly.directive';
import { SelectInvalidDirective } from 'src/app/shared/directives/selectInvalid.directive';
import { SelectReadOnlyDirective } from 'src/app/shared/directives/selectReadOnly.directive';
import { BimModel } from 'src/app/shared/models/bimModel/bimModel.models';
import { TryGetResult } from 'src/app/shared/models/common/tryGetResult.models';
import { Visualization } from 'src/app/shared/models/visualization/visualization.models';
import { VisualizationPiece } from 'src/app/shared/models/visualization/visualizationPiece.models';
import { ConfirmDialogService } from 'src/app/shared/services/confirmDialog.service';
import { DataAccessService } from 'src/app/shared/services/dataAccess.service';
import { NotificationService } from 'src/app/shared/services/notification.service';
import { CheckUtils } from 'src/app/shared/utils/check.utils';
import { ErrorUtils } from 'src/app/shared/utils/error.utils';
import { HttpRequestCanceller } from 'src/app/shared/utils/httpRequestCanceller.utils';
import { IconsUtils } from 'src/app/shared/utils/icons.utils';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';
import { BimModelMapper } from 'src/app/shared/utils/mappers/bimModelMapper.utils';
import { VisualizationMapper } from 'src/app/shared/utils/mappers/visualizationMapper.utils';
import { RequestUtils } from 'src/app/shared/utils/request.utils';
import { LoggedUserManager } from 'src/app/shared/utils/session/loggedUserManager.utils';
import { StringUtils } from 'src/app/shared/utils/string.utils';
import { ValidationResult } from 'src/app/validators/common/validationResult/validationResult.models';
import { VisualizationValidator } from 'src/app/validators/visualization/visualization.validator';

/** Ficha de una visualización en la lista del editor, con lo que la plantilla necesita ya calculado. */
type VisualizationListItem = {
	IconText: string;
	IconUrl: string;
	IsSelected: boolean;
	Visualization: Visualization;
};

/** Editor de las visualizaciones: lista de visualizaciones, sus datos generales y las piezas que llevan sobre el modelo. */
@Component({
	selector: 'app-visualization-editor',
	imports: [
		EditorCardComponent,
		EditorShellComponent,
		FormsModule,
		MatButtonModule,
		MatCheckboxModule,
		MatFormFieldModule,
		MatInputModule,
		MatProgressBarModule,
		MatSelectModule,
		MatTabsModule,
		CheckboxReadOnlyDirective,
		InvalidDirective,
		ReadOnlyDirective,
		SelectInvalidDirective,
		SelectReadOnlyDirective,
		VisualizationPieceWorkspaceComponent
	],
	templateUrl: './visualizationEditor.component.html',
	styleUrl: './visualizationEditor.component.scss'
})
export class VisualizationEditorComponent implements OnDestroy, OnInit {
	//#region PUBLIC CONSTANTS

	//#region LANGUAGE TEXTS

	/** Etiqueta de la descripción. */
	public readonly DESCRIPTION_TEXT: string = LanguageManager.GetText('WEB_DESCRIPTION');

	/** Título de la pestaña de datos generales. */
	public readonly GENERAL_TEXT: string = LanguageManager.GetText('WEB_GENERAL');

	/** Texto mientras se carga la lista. */
	public readonly LOADING_TEXT: string = LanguageManager.GetText('WEB_LOADING');

	/** Etiqueta del modelo BIM sobre el que trabaja la visualización. */
	public readonly MODEL_TEXT: string = LanguageManager.GetText('VE_MODEL');

	/** Etiqueta del nombre. */
	public readonly NAME_TEXT: string = LanguageManager.GetText('WEB_NAME');

	/** Texto cuando no hay ninguna visualización en la lista. */
	public readonly NO_ITEMS_TEXT: string = LanguageManager.GetText('VE_NO_ITEMS');

	/** Texto cuando no hay ninguna visualización seleccionada. */
	public readonly NO_SELECTION_TEXT: string = LanguageManager.GetText('VE_NO_SELECTION');

	/** Etiqueta de las observaciones. */
	public readonly OBSERVATIONS_TEXT: string = LanguageManager.GetText('WEB_OBSERVATIONS');

	/** Título de la pestaña de piezas. */
	public readonly PIECES_TEXT: string = LanguageManager.GetText('VE_PIECES');

	/** Etiqueta de la casilla de visibilidad para otros usuarios. */
	public readonly PUBLIC_TEXT: string = LanguageManager.GetText('VE_PUBLIC');

	/** Texto de ayuda del buscador. */
	public readonly SEARCH_TEXT: string = LanguageManager.GetText('VE_SEARCH');

	/** Título del editor. */
	public readonly TITLE_TEXT: string = LanguageManager.GetText('WEB_VISUALIZATIONS');

	//#endregion LANGUAGE TEXTS

	//#endregion PUBLIC CONSTANTS

	//#region PRIVATE CONSTANTS

	/** Icono de las visualizaciones de otro usuario. */
	private readonly _OTHER_USER_ICON: string = IconsUtils.GetUrl(IconName.PUBLIC);

	/** Icono de las visualizaciones del usuario. */
	private readonly _OWN_ICON: string = IconsUtils.GetUrl(IconName.USER);

	//#region LANGUAGE TEXTS

	/** Aviso de que la visualización se ha añadido. */
	private readonly _ADDED_TEXT: string = LanguageManager.GetText('VE_ADDED');

	/** Pregunta de confirmación del borrado, con el nombre de la visualización en `{0}`. */
	private readonly _DELETE_CONFIRM_TEXT: string = LanguageManager.GetText('VE_DELETE_CONFIRM');

	/** Aviso de que no se ha podido borrar la visualización. */
	private readonly _DELETE_ERROR_TEXT: string = LanguageManager.GetText('VE_DELETE_ERROR');

	/** Aviso de que la visualización se ha eliminado. */
	private readonly _DELETED_TEXT: string = LanguageManager.GetText('VE_DELETED');

	/** Pregunta de confirmación para descartar los cambios sin guardar. */
	private readonly _DISCARD_CONFIRM_TEXT: string = LanguageManager.GetText('WEB_DISCARD_CONFIRM');

	/** Aviso de que no se han podido cargar las visualizaciones. */
	private readonly _LOAD_ERROR_TEXT: string = LanguageManager.GetText('VE_LOAD_ERROR');

	/** Aviso de que no se han podido cargar los modelos BIM. */
	private readonly _MODELS_LOAD_ERROR_TEXT: string = LanguageManager.GetText('WEB_BIM_MODELS_LOAD_ERROR');

	/** Nombre del icono de una visualización de otro usuario. */
	private readonly _OTHER_USER_TEXT: string = LanguageManager.GetText('VE_OTHER_USER');

	/** Nombre del icono de una visualización del usuario. */
	private readonly _OWN_TEXT: string = LanguageManager.GetText('VE_OWN');

	/** Aviso de que no se han podido cargar las piezas de la visualización. */
	private readonly _PIECES_LOAD_ERROR_TEXT: string = LanguageManager.GetText('VE_PIECES_LOAD_ERROR');

	/** Aviso de que no se ha podido guardar la visualización. */
	private readonly _SAVE_ERROR_TEXT: string = LanguageManager.GetText('VE_SAVE_ERROR');

	/** Aviso de que la visualización se ha modificado. */
	private readonly _UPDATED_TEXT: string = LanguageManager.GetText('VE_UPDATED');

	//#endregion LANGUAGE TEXTS

	//#endregion PRIVATE CONSTANTS

	//#region PUBLIC PROPERTIES

	/** `true` si el usuario puede borrar la visualización seleccionada. */
	public CanDelete: boolean = false;

	/** `true` si el usuario puede editar la visualización seleccionada. */
	public CanEdit: boolean = false;

	/** `true` si se pueden añadir, quitar, mover y cambiar piezas: se está editando y ya están cargadas. */
	public CanEditPieces: boolean = false;

	/** Datos de la visualización abierta: son los que se editan, y solo se guardan al pulsar guardar. */
	public Draft: Visualization = this.createEmptyVisualization();

	/** Mensajes de las reglas rotas en la última validación. Una lista nueva abre el panel de errores. */
	public ErrorMessages: string[] = [];

	/** `true` si hay una visualización abierta (seleccionada o nueva): se muestra su detalle. */
	public HasDetail: boolean = false;

	/** `true` si hay alguna visualización que mostrar en la lista. */
	public HasItems: boolean = false;

	/** `true` si hay una visualización seleccionada en la lista. */
	public HasSelection: boolean = false;

	/** `true` mientras se guarda o se borra: se bloquean los botones. */
	public IsBusy: boolean = false;

	/** `true` mientras se edita (o se añade) una visualización. */
	public IsEditing: boolean = false;

	/** `true` mientras se carga la lista: se muestra una barra de carga y el resto sigue disponible. */
	public IsLoadingList: boolean = true;

	/** `true` mientras se cargan las piezas de la visualización abierta. */
	public IsLoadingPieces: boolean = false;

	/** `true` si el modelo BIM no se puede cambiar: solo se elige al añadir una visualización. */
	public IsModelDisabled: boolean = true;

	/** `true` si el detalle solo se puede leer. */
	public IsReadOnly: boolean = true;

	/** Fichas de la lista, ya filtradas por el buscador. */
	public ListItems: VisualizationListItem[] = [];

	/** `true` si falta elegir el modelo BIM. */
	public ModelInvalid: boolean = false;

	/** Modelos BIM entre los que se elige, ordenados por nombre. */
	public Models: BimModel[] = [];

	/** `true` si falta el nombre. */
	public NameInvalid: boolean = false;

	/** Modelo BIM de la visualización abierta, para la previsualización. Es `null` si no hay modelo elegido. */
	public PreviewModel: BimModel | null = null;

	//#endregion PUBLIC PROPERTIES

	//#region PRIVATE PROPERTIES

	/** Corta las peticiones pendientes de las listas, los modelos y el guardado al cerrar el editor. */
	private readonly _Canceller: HttpRequestCanceller = new HttpRequestCanceller();

	/** Hace las preguntas de confirmación. */
	private readonly _Confirm: ConfirmDialogService;

	/** Llamadas al API. */
	private readonly _DataAccess: DataAccessService;

	/** Diálogo que contiene el editor, para cerrarlo. */
	private readonly _DialogRef: MatDialogRef<VisualizationEditorComponent>;

	/** `true` si hay cambios sin guardar en el detalle. */
	private _IsDirty: boolean = false;

	/** `true` si la visualización abierta es nueva y aún no se ha guardado. */
	private _IsNew: boolean = false;

	/** Avisa al usuario de los fallos. */
	private readonly _Notification: NotificationService;

	/** Corta la carga de las piezas al abrir otra visualización y al cerrar el editor, sin afectar a las demás peticiones. */
	private readonly _PiecesCanceller: HttpRequestCanceller = new HttpRequestCanceller();

	/** Texto del buscador, en minúsculas. */
	private _SearchText: string = STRING_UNDEFINED;

	/** Visualización seleccionada en la lista. Es `null` si no hay ninguna, o si se está añadiendo una nueva. */
	private _Selected: Visualization | null = null;

	/** Valida los datos de la visualización al guardar. */
	private readonly _Validator: VisualizationValidator = new VisualizationValidator();

	/** Todas las visualizaciones, sin filtrar. */
	private _Visualizations: Visualization[] = [];

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
		dialogRef: MatDialogRef<VisualizationEditorComponent>,
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
		this._PiecesCanceller.Destroy();
	}

	public ngOnInit(): void {
		this.loadModels();
		this.loadVisualizations();
	}

	//#endregion ANGULAR LIFECYCLE

	//#region SUBSCRIBERS

	public async OnAddClicked(): Promise<void> {
		if (!this.IsBusy && (await this.confirmDiscard())) {
			this.openVisualization(null);
			this._IsNew = true;
			this.setEditing(true);
			this.refreshDetail();
		} else {
			// Hay una operación en curso o el usuario prefiere seguir con lo que estaba editando
		}
	}

	public async OnBackClicked(): Promise<void> {
		if (!this.IsBusy && (await this.confirmDiscard())) {
			this.openVisualization(null);
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

	public async OnDeleteClicked(): Promise<void> {
		if (!CheckUtils.IsNull(this._Selected)) {
			const visualization: Visualization = this._Selected;

			if (await this._Confirm.Show(StringUtils.Format(this._DELETE_CONFIRM_TEXT, [visualization.Name]), ConfirmDialogType.DANGER)) {
				await this.deleteVisualization(visualization);
			} else {
				// El usuario cancela el borrado
			}
		} else {
			// No hay nada que borrar
		}
	}

	public OnDescriptionChanged(description: string): void {
		this.Draft.Description = description;
		this._IsDirty = true;
	}

	public async OnDiscardClicked(): Promise<void> {
		if (await this.confirmDiscard()) {
			this.openVisualization(this._Selected);
		} else {
			// El usuario prefiere seguir con lo que estaba editando
		}
	}

	public OnEditClicked(): void {
		this.setEditing(true);
	}

	public OnModelChanged(modelId: number): void {
		this.Draft.BimModelId = modelId;
		this.ModelInvalid = false;
		this._IsDirty = true;
		this.refreshPreviewModel();
	}

	public OnNameChanged(name: string): void {
		this.Draft.Name = name;
		this.NameInvalid = false;
		this._IsDirty = true;
	}

	public OnObservationsChanged(observations: string): void {
		this.Draft.Observations = observations;
		this._IsDirty = true;
	}

	public OnPiecesChanged(): void {
		this._IsDirty = true;
	}

	public OnPublicChanged(isPublic: boolean): void {
		this.Draft.IsPublic = isPublic;
		this._IsDirty = true;
	}

	public async OnSaveClicked(): Promise<void> {
		const validation: ValidationResult = this._Validator.Validate(this.Draft);

		this.ErrorMessages = validation.GetMessages();
		this.ModelInvalid = validation.HasField(VisualizationValidator.MODEL);
		this.NameInvalid = validation.HasField(VisualizationValidator.NAME);

		if (validation.IsValid()) {
			await this.saveVisualization();
		} else {
			// Hay reglas rotas: se muestran en el panel de errores y no se guarda
		}
	}

	public OnSearchChanged(text: string): void {
		this._SearchText = text.trim().toLowerCase();
		this.refreshList();
	}

	public async OnVisualizationSelected(visualization: Visualization): Promise<void> {
		if (!this.IsBusy && (await this.confirmDiscard())) {
			this.openVisualization(visualization);
		} else {
			// Hay una operación en curso o el usuario prefiere seguir con lo que estaba editando
		}
	}

	//#endregion SUBSCRIBERS

	//#region PRIVATE METHODS

	/**
	 * Hace una copia de las piezas, para editarlas sin tocar las originales hasta guardar.
	 * @param pieces Piezas a copiar. Con `null` (aún no cargadas), el resultado también es `null`.
	 */
	private clonePieces(pieces: VisualizationPiece[] | null): VisualizationPiece[] | null {
		let result: VisualizationPiece[] | null = null;

		if (!CheckUtils.IsNull(pieces)) {
			result = pieces.map((piece: VisualizationPiece): VisualizationPiece => piece.Clone());
		} else {
			// Sin piezas cargadas no hay nada que copiar
		}

		return result;
	}

	/**
	 * Hace una copia de una visualización, para editarla sin tocar la original hasta guardar.
	 * @param visualization Visualización a copiar.
	 */
	private cloneVisualization(visualization: Visualization): Visualization {
		return new Visualization(
			visualization.Id,
			visualization.UserId,
			visualization.BimModelId,
			visualization.Name,
			visualization.Description,
			visualization.Observations,
			visualization.IsPublic,
			this.clonePieces(visualization.Pieces)
		);
	}

	/**
	 * Si hay cambios sin guardar, pregunta si se descartan.
	 * @returns `true` si se puede seguir (no había cambios o el usuario acepta descartarlos).
	 */
	private async confirmDiscard(): Promise<boolean> {
		let result: boolean = true;

		if (this.IsEditing && this._IsDirty) {
			result = await this._Confirm.Show(this._DISCARD_CONFIRM_TEXT, ConfirmDialogType.QUESTION);
		} else {
			// No hay cambios que perder
		}

		return result;
	}

	/** Crea una visualización en blanco, para el detalle cuando no hay ninguna abierta o se está añadiendo una. */
	private createEmptyVisualization(): Visualization {
		return new Visualization(
			ID_NUMERIC_UNDEFINED,
			ID_NUMERIC_UNDEFINED,
			ID_NUMERIC_UNDEFINED,
			STRING_UNDEFINED,
			STRING_UNDEFINED,
			STRING_UNDEFINED,
			false,
			[]
		);
	}

	/**
	 * Borra una visualización y la quita de la lista.
	 * @param visualization Visualización a borrar.
	 */
	private async deleteVisualization(visualization: Visualization): Promise<void> {
		this.setBusy(true);

		try {
			const result: TryGetResult<void> = await RequestUtils.AwaitRequest(
				this._DataAccess.Visualizations.Delete(visualization.Id, VISUALIZATION_LOGICAL_DELETE),
				this._Canceller
			);

			if (result.Success) {
				this._Visualizations = this._Visualizations.filter((item: Visualization): boolean => item.Id !== visualization.Id);
				this.openVisualization(null);
				this._Notification.Send(this._DELETED_TEXT, NotificationLevel.SUCCESS);
			} else {
				// Petición cancelada: no hay nada que hacer
			}
		} catch (error) {
			this._Notification.Send(this._DELETE_ERROR_TEXT, NotificationLevel.DANGER);
			console.warn(`VisualizationEditor.deleteVisualization() => ${ErrorUtils.GetMessage(error)}`);
		} finally {
			this.setBusy(false);
		}
	}

	/** Carga los modelos BIM entre los que se elige, ordenados por nombre. */
	private async loadModels(): Promise<void> {
		try {
			const result: TryGetResult<BimModelDto[]> = await RequestUtils.AwaitRequest(
				this._DataAccess.BimModels.GetAll(),
				this._Canceller
			);

			if (result.Success) {
				this.Models = (result.Result as BimModelDto[])
					.map((dto: BimModelDto): BimModel => BimModelMapper.ToModel(dto))
					.sort((a: BimModel, b: BimModel): number => a.Name.localeCompare(b.Name));
				this.refreshPreviewModel();
			} else {
				// Petición cancelada: no hay nada que hacer
			}
		} catch (error) {
			this._Notification.Send(this._MODELS_LOAD_ERROR_TEXT, NotificationLevel.DANGER);
			console.warn(`VisualizationEditor.loadModels() => ${ErrorUtils.GetMessage(error)}`);
		}
	}

	/**
	 * Carga las piezas de una visualización de la lista, que se recupera sin ellas, y las deja también en el detalle si
	 * esa sigue siendo la visualización abierta.
	 * @param visualization Visualización cuyas piezas se cargan.
	 */
	private async loadPieces(visualization: Visualization): Promise<void> {
		this.IsLoadingPieces = true;
		this.refreshCanEditPieces();

		try {
			const result: TryGetResult<VisualizationDto> = await RequestUtils.AwaitRequest(
				this._DataAccess.Visualizations.Get(visualization.Id, VISUALIZATION_DEPTH_WITH_PIECES),
				this._PiecesCanceller
			);

			if (result.Success) {
				visualization.Pieces = VisualizationMapper.ToModel(result.Result as VisualizationDto).Pieces;

				if (this._Selected === visualization) {
					this.Draft.Pieces = this.clonePieces(visualization.Pieces);
				} else {
					// Ya se abrió otra visualización: las piezas quedan guardadas en esta para cuando se vuelva a abrir
				}
			} else {
				// Petición cancelada: no hay nada que hacer
			}
		} catch (error) {
			this._Notification.Send(this._PIECES_LOAD_ERROR_TEXT, NotificationLevel.DANGER);
			console.warn(`VisualizationEditor.loadPieces() => ${ErrorUtils.GetMessage(error)}`);
		} finally {
			// Si ya se abrió otra visualización, el estado es el de esa
			if (this._Selected === visualization) {
				this.IsLoadingPieces = false;
				this.refreshCanEditPieces();
			} else {
				// Sigue en curso la carga de la otra
			}
		}
	}

	/** Carga la lista de visualizaciones, sin sus piezas. */
	private async loadVisualizations(): Promise<void> {
		try {
			const result: TryGetResult<VisualizationDto[]> = await RequestUtils.AwaitRequest(
				this._DataAccess.Visualizations.GetAll(VISUALIZATION_DEPTH_WITHOUT_PIECES),
				this._Canceller
			);

			if (result.Success) {
				this._Visualizations = (result.Result as VisualizationDto[]).map(
					(dto: VisualizationDto): Visualization => VisualizationMapper.ToModel(dto)
				);
				this.refreshList();
			} else {
				// Petición cancelada: no hay nada que hacer
			}
		} catch (error) {
			this._Notification.Send(this._LOAD_ERROR_TEXT, NotificationLevel.DANGER);
			console.warn(`VisualizationEditor.loadVisualizations() => ${ErrorUtils.GetMessage(error)}`);
		} finally {
			// Si no se ha podido cargar, la lista se queda vacía: el editor sigue siendo usable
			this.IsLoadingList = false;
		}
	}

	/**
	 * Abre una visualización en el detalle, sin edición y sin cambios pendientes.
	 * @param visualization Visualización a abrir. Con `null`, el detalle queda cerrado.
	 */
	private openVisualization(visualization: Visualization | null): void {
		// Las piezas que estuvieran pidiéndose de la visualización anterior ya no hacen falta
		this._PiecesCanceller.Cancel();

		this._IsDirty = false;
		this._IsNew = false;
		this._Selected = visualization;
		this.Draft = CheckUtils.IsNull(visualization) ? this.createEmptyVisualization() : this.cloneVisualization(visualization);
		this.IsLoadingPieces = false;
		this.ErrorMessages = [];
		this.ModelInvalid = false;
		this.NameInvalid = false;
		this.setEditing(false);
		this.refreshDetail();
		this.refreshList();
		this.refreshPreviewModel();

		if (!CheckUtils.IsNull(visualization) && CheckUtils.IsNull(visualization.Pieces)) {
			// La lista trae las visualizaciones sin sus piezas: se piden al abrirla
			this.loadPieces(visualization);
		} else {
			// Es nueva, está cerrada o ya tiene sus piezas
		}
	}

	/** Calcula si se pueden cambiar las piezas: se está editando y ya están cargadas. */
	private refreshCanEditPieces(): void {
		// Si las piezas no se han podido cargar (`null`), no se dejan editar: el clic en el modelo no haría nada
		this.CanEditPieces = this.IsEditing && !this.IsLoadingPieces && !CheckUtils.IsNull(this.Draft.Pieces);
	}

	/** Deja calculado lo que la plantilla necesita de la visualización abierta. */
	private refreshDetail(): void {
		this.HasDetail = !CheckUtils.IsNull(this._Selected) || this._IsNew;
		this.HasSelection = !CheckUtils.IsNull(this._Selected);
		this.refreshPermissions();
	}

	/** Deja calculadas las fichas de la lista: ordenadas por nombre y filtradas por el buscador. */
	private refreshList(): void {
		const selectedId: number = CheckUtils.IsNull(this._Selected) ? ID_NUMERIC_UNDEFINED : this._Selected.Id;
		const userId: number = LoggedUserManager.GetUserId();

		this.ListItems = this._Visualizations
			.filter(
				(item: Visualization): boolean =>
					item.Name.toLowerCase().includes(this._SearchText) || item.Description.toLowerCase().includes(this._SearchText)
			)
			.sort((a: Visualization, b: Visualization): number => a.Name.localeCompare(b.Name))
			.map((item: Visualization): VisualizationListItem => ({
				IconText: item.UserId === userId ? this._OWN_TEXT : this._OTHER_USER_TEXT,
				IconUrl: item.UserId === userId ? this._OWN_ICON : this._OTHER_USER_ICON,
				IsSelected: item.Id === selectedId,
				Visualization: item
			}));
		this.HasItems = this.ListItems.length > 0;
	}

	/** Calcula si el usuario puede editar y borrar la visualización seleccionada: las suyas o, con el permiso, las de cualquiera. */
	private refreshPermissions(): void {
		if (CheckUtils.IsNull(this._Selected)) {
			this.CanDelete = false;
			this.CanEdit = false;
		} else if (this._Selected.UserId === LoggedUserManager.GetUserId()) {
			this.CanDelete = LoggedUserManager.HasPermission(Permission.VISUALIZATIONS_DELETE_OWN);
			this.CanEdit = LoggedUserManager.HasPermission(Permission.VISUALIZATIONS_EDIT_OWN);
		} else {
			this.CanDelete = LoggedUserManager.HasPermission(Permission.VISUALIZATIONS_DELETE_ANY);
			this.CanEdit = LoggedUserManager.HasPermission(Permission.VISUALIZATIONS_EDIT_ANY);
		}
	}

	/** Busca el modelo BIM de la visualización abierta, para la previsualización. */
	private refreshPreviewModel(): void {
		const model: BimModel | undefined = this.Models.find((item: BimModel): boolean => item.Id === this.Draft.BimModelId);

		this.PreviewModel = CheckUtils.IsUndefined(model) ? null : model;
	}

	/** Guarda los datos de la visualización abierta. */
	private async saveVisualization(): Promise<void> {
		const wasNew: boolean = this._IsNew;

		this.setBusy(true);

		try {
			const dto: VisualizationDto = VisualizationMapper.ToDto(this.Draft);
			const response: TryGetResult<VisualizationDto> = wasNew
				? await RequestUtils.AwaitRequest(this._DataAccess.Visualizations.Add(dto), this._Canceller)
				: await RequestUtils.AwaitRequest(this._DataAccess.Visualizations.Update(this.Draft.Id, dto), this._Canceller);

			if (response.Success) {
				const saved: Visualization = VisualizationMapper.ToModel(response.Result as VisualizationDto);

				this.upsertVisualization(saved);
				this.openVisualization(saved);
				this._Notification.Send(wasNew ? this._ADDED_TEXT : this._UPDATED_TEXT, NotificationLevel.SUCCESS);
			} else {
				// Petición cancelada: no hay nada que hacer
			}
		} catch (error) {
			this._Notification.Send(this._SAVE_ERROR_TEXT, NotificationLevel.DANGER);
			console.warn(`VisualizationEditor.saveVisualization() => ${ErrorUtils.GetMessage(error)}`);
		} finally {
			this.setBusy(false);
		}
	}

	/**
	 * Marca si hay un guardado o un borrado en curso. Mientras lo hay, el diálogo no se puede cerrar (ni con Escape ni
	 * pulsando fuera), porque al cerrarse se cancelarían las peticiones y la visualización podría quedar a medias.
	 * @param isBusy `true` si hay una operación en curso.
	 */
	private setBusy(isBusy: boolean): void {
		this.IsBusy = isBusy;
		this._DialogRef.disableClose = isBusy;
	}

	/**
	 * Entra o sale del modo edición.
	 * @param isEditing `true` para editar.
	 */
	private setEditing(isEditing: boolean): void {
		this.IsEditing = isEditing;
		this.IsModelDisabled = !(isEditing && this._IsNew);
		this.IsReadOnly = !isEditing;
		this.refreshCanEditPieces();
	}

	/**
	 * Añade la visualización a la lista o, si ya estaba, la sustituye.
	 * @param visualization Visualización guardada.
	 */
	private upsertVisualization(visualization: Visualization): void {
		const index: number = this._Visualizations.findIndex((item: Visualization): boolean => item.Id === visualization.Id);

		if (index >= 0) {
			this._Visualizations[index] = visualization;
		} else {
			this._Visualizations.push(visualization);
		}

		this.refreshList();
	}

	//#endregion PRIVATE METHODS
}
