import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';

import { STRING_UNDEFINED } from 'src/app/shared/definitions/constants.definitions';
import { LanguageOption } from 'src/app/shared/definitions/language.definitions';
import { LanguageManager } from 'src/app/shared/utils/language/languageManager.utils';

/** Panel con el que se elige el idioma de la aplicación entre los admitidos. */
@Component({
	selector: 'app-application-settings-editor-language-panel',
	imports: [MatFormFieldModule, MatSelectModule],
	templateUrl: './languagePanel.component.html',
	styleUrl: './languagePanel.component.scss'
})
export class ApplicationSettingsEditorLanguagePanelComponent implements OnDestroy {
	//#region DECORATORS

	/** `true` si el valor solo se puede leer. */
	@Input() public IsReadOnly: boolean = true;

	/** Etiqueta del campo. */
	@Input() public Label: string = STRING_UNDEFINED;

	/** Código del idioma elegido. */
	@Input() public Value: string = STRING_UNDEFINED;

	/** Se emite con el código del idioma cada vez que se elige otro. */
	@Output() public valueChanged: EventEmitter<string> = new EventEmitter<string>();

	//#endregion DECORATORS

	//#region PUBLIC CONSTANTS

	/** Idiomas admitidos, cada uno con su nombre en su propio idioma. */
	public readonly OPTIONS: LanguageOption[] = LanguageManager.GetOptions();

	//#endregion PUBLIC CONSTANTS

	//#region EMITTERS

	private emitValueChanged(value: string): void {
		this.valueChanged.emit(value);
	}

	//#endregion EMITTERS

	//#region ANGULAR LIFECYCLE

	public ngOnDestroy(): void {
		this.valueChanged.complete();
	}

	//#endregion ANGULAR LIFECYCLE

	//#region SUBSCRIBERS

	public OnSelectionChange(event: MatSelectChange): void {
		this.emitValueChanged(String(event.value));
	}

	//#endregion SUBSCRIBERS
}
